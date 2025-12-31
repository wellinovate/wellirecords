import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage, MapPlace } from "../types";

const apiKey = process.env.API_KEY || '';

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