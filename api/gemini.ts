import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Missing action parameter' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured on server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    switch (action) {
      case 'chat': {
        const { newMessage } = req.body;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: newMessage,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "You are a helpful medical assistant for WelliRecord. You help users understand their health, find information, and interpret medical terms. Always advise users to consult a real doctor for medical emergencies.",
          }
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let sources: Array<{ uri: string; title: string }> = [];
        if (groundingChunks) {
          groundingChunks.forEach((chunk: any) => {
            if (chunk.web) {
              sources.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
          });
        }

        return res.status(200).json({
          id: Date.now().toString(),
          role: 'model',
          text: response.text || "I couldn't generate a response.",
          groundingSources: sources
        });
      }

      case 'maps': {
        const { query, latitude, longitude } = req.body;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Find medical providers: ${query}`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude,
                  longitude
                }
              }
            }
          },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let places: any[] = [];
        if (groundingChunks) {
          groundingChunks.forEach((chunk: any) => {
            if (chunk.maps) {
              places.push({
                title: chunk.maps.title,
                uri: chunk.maps.uri,
                snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.snippet,
                location: chunk.maps.center
              });
            }
          });
        }

        return res.status(200).json({
          text: response.text || "Here are some providers I found nearby.",
          places
        });
      }

      case 'analyze': {
        const { recordText } = req.body;
        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: `Analyze this medical record summary and explain it in simple terms for a patient. Identify any key actions they might need to take:\n\n${recordText}`,
          config: {
            thinkingConfig: { thinkingBudget: 1024 }
          }
        });
        return res.status(200).json({ text: response.text || "Analysis complete." });
      }

      case 'predict': {
        const { metricsSummary } = req.body;
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `You are a predictive health analytics engine. Based on the following recent health vitals, provide a concise, forward-looking health prediction and 1 actionable recommendation. Do not give medical advice, but wellness trends.\n\nVitals: ${metricsSummary}`,
        });
        return res.status(200).json({ text: response.text || "Prediction currently unavailable." });
      }

      case 'extract': {
        const { base64Image, mimeType } = req.body;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            },
            {
              text: "Analyze this image of a medical document. Extract the following fields: 'title' (document title), 'date' (YYYY-MM-DD), 'provider' (doctor or facility), 'type' (e.g., Lab Result, Prescription), and 'summary' (a brief summary of findings). Return the response in JSON format."
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                provider: { type: Type.STRING },
                type: { type: Type.STRING },
                summary: { type: Type.STRING }
              }
            }
          }
        });

        const text = response.text;
        if (!text) throw new Error("No response text");
        return res.status(200).json(JSON.parse(text));
      }

      case 'triage': {
        const { history, newMessage } = req.body;
        const contents = [
          ...history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          })),
          { role: 'user', parts: [{ text: newMessage }] }
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: `You are Welli-AI, the core intelligence engine of the Wellinovate Ecosystem.
            
            Your role is to serve as the preliminary health assistant within WelliCare (The Mother Platform).
            
            Context: Wellinovate is not just an app; it is Africa’s First Integrated, Decentralized, Predictive Health & Wellness Network.
            
            Your operational protocol:
            1. **Listen & Empathize**: Acknowledge user symptoms with empathy.
            2. **Assess Duration & Severity (CRITICAL)**: Before suggesting ANY solutions or ecosystem modules, you MUST ask clarifying questions about:
               - How long they have been feeling this way (Duration).
               - How intense the symptoms are (Severity/Pain Scale).
            3. **Educate & Disclaim**: Provide general health context based on their answers. ALWAYS state you are an AI, not a doctor.
            4. **Direct to Ecosystem with EXPLICIT Rationale**: You must connect the recommended module directly to the user's specific situation using the following logic:
               
               - **If symptoms are Mild & Short-term** (e.g., slight headache, cold):
                 Recommend **WelliMarket**.
                 *Required Rationale format:* "Since your [symptom] is mild and only started recently, you might find relief with OTC remedies available on WelliMarket."
    
               - **If symptoms are Persistent, Recurring, or Unexplained** (e.g., fever > 3 days, recurring fatigue):
                 Recommend **WelliBio**.
                 *Required Rationale format:* "Because your [symptom] has persisted for [duration], it is important to get a diagnostic test at WelliBio to rule out underlying causes like Malaria or Typhoid."
    
               - **If symptoms are Severe, High Pain, or Complex**:
                 Recommend **WelliCare Telemedicine**.
                 *Required Rationale format:* "Given the severity of the pain you described, I strongly recommend speaking with a specialist immediately via WelliCare Telemedicine."
    
               - **If symptoms are Critical/Emergency** (chest pain, difficulty breathing, trauma):
                 Recommend **WelliCare SOS**.
                 *Required Rationale format:* "These are signs of a medical emergency. Please use the WelliCare SOS feature immediately to alert responders."
    
            **Rule**: Never just list a module. You must explain the link between their specific symptom severity/duration and the module functionality.
    
            Keep responses concise, professional, and culturally relevant to West Africa/Nigeria.`,
            temperature: 0.7,
          }
        });

        return res.status(200).json({ text: response.text || "I couldn't generate a response." });
      }

      case 'voice': {
        const { base64Audio, mimeType, instruction } = req.body;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              inlineData: {
                data: base64Audio,
                mimeType: mimeType || 'audio/webm'
              }
            }
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            systemInstruction: instruction
          }
        });

        const base64AudioOut = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
        const textOut = response.text || '';

        return res.status(200).json({
          audio: base64AudioOut,
          text: textOut
        });
      }

      default:
        return res.status(400).json({ error: `Unsupported action: ${action}` });
    }
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return res.status(500).json({ error: 'Gemini request processing failed', details: String(error) });
  }
}
