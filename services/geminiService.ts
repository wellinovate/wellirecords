import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MapPlace } from "../types";

const apiKey = process.env.API_KEY || '';


let chatSession: Chat | null = null;

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Chat with Search Grounding
export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string
): Promise<ChatMessage> => {
  if (!apiKey) throw new Error("API Key not found");
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
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

    return {
      id: Date.now().toString(),
      role: 'model',
      text: response.text || "I couldn't generate a response.",
      groundingSources: sources
    };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      id: Date.now().toString(),
      role: 'model',
      text: "I'm having trouble connecting to the health network right now. Please try again."
    };
  }
};

// Maps Grounding
export const findMedicalPlaces = async (
  query: string,
  latitude: number,
  longitude: number
): Promise<{ text: string; places: MapPlace[] }> => {
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  try {
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
    let places: MapPlace[] = [];

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

    return {
      text: response.text || "Here are some providers I found nearby.",
      places
    };

  } catch (error) {
    console.error("Gemini Maps Error:", error);
    throw error;
  }
};

// Analyze Record
export const analyzeHealthRecord = async (recordText: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze this medical record summary and explain it in simple terms for a patient. Identify any key actions they might need to take:\n\n${recordText}`,
            config: {
                thinkingConfig: { thinkingBudget: 1024 }
            }
        });
        return response.text || "Analysis complete.";
    } catch (error) {
        console.error("Analysis Error:", error);
        return "Unable to analyze record at this time.";
    }
}

// Predict Health Trends
export const predictHealthTrends = async (metricsSummary: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a predictive health analytics engine. Based on the following recent health vitals, provide a concise, forward-looking health prediction and 1 actionable recommendation. Do not give medical advice, but wellness trends.\n\nVitals: ${metricsSummary}`,
        });
        return response.text || "Prediction currently unavailable.";
    } catch (error) {
        console.error("Prediction Error:", error);
        return "AI prediction service unavailable offline.";
    }
}

// Extract Data from Document Image
export const extractDocumentData = async (base64Image: string, mimeType: string): Promise<any> => {
    if (!apiKey) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            // Corrected model for Vision tasks. 'gemini-2.5-flash-image' is for generation.
            model: "gemini-2.5-flash", 
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: "Analyze this image of a medical document. Extract the following fields: 'title' (document title), 'date' (YYYY-MM-DD), 'provider' (doctor or facility), 'type' (e.g., Lab Result, Prescription), and 'summary' (a brief summary of findings). Return the response in JSON format."
                    }
                ]
            },
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
        return JSON.parse(text);

    } catch (error) {
        console.error("Document Extraction Error:", error);
        throw error;
    }
}

export const initializeChat = async () => {
  try {
    const ai = getAIClient();
    
    // Using gemini-2.5-flash for fast, responsive triage chat
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
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
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to init chat", error);
    return false;
  }
};

export const sendMessageToAI = async (message: string): Promise<AsyncIterable<string>> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
    throw new Error("Chat session could not be initialized.");
  }

  try {
    const result = await chatSession.sendMessageStream({ message });
    
    // Return an async iterable that yields text chunks
    return {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
            yield c.text;
          }
        }
      }
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};