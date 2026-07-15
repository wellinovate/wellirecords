import { ChatMessage, MapPlace } from "../types/types";

const callGeminiProxy = async (action: string, payload: any) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Proxy error: ${response.statusText}`);
  }
  return response.json();
};

// Chat with Search Grounding
export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string
): Promise<ChatMessage> => {
  try {
    return await callGeminiProxy('chat', { history, newMessage });
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
  try {
    return await callGeminiProxy('maps', { query, latitude, longitude });
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    throw error;
  }
};

// Analyze Record
export const analyzeHealthRecord = async (recordText: string): Promise<string> => {
  try {
    const data = await callGeminiProxy('analyze', { recordText });
    return data.text || "Analysis complete.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Unable to analyze record at this time.";
  }
};

// Predict Health Trends
export const predictHealthTrends = async (metricsSummary: string): Promise<string> => {
  try {
    const data = await callGeminiProxy('predict', { metricsSummary });
    return data.text || "Prediction currently unavailable.";
  } catch (error) {
    console.error("Prediction Error:", error);
    return "AI prediction service unavailable offline.";
  }
};

// Extract Data from Document Image
export const extractDocumentData = async (base64Image: string, mimeType: string): Promise<any> => {
  try {
    return await callGeminiProxy('extract', { base64Image, mimeType });
  } catch (error) {
    console.error("Document Extraction Error:", error);
    throw error;
  }
};

// Internal history for Welli-AI triage sessions
let chatSessionHistory: Array<{ role: string; text: string }> = [];

export const initializeChat = async (): Promise<boolean> => {
  chatSessionHistory = [];
  return true;
};

export const sendMessageToAI = async (message: string): Promise<AsyncIterable<string>> => {
  try {
    const data = await callGeminiProxy('triage', { history: chatSessionHistory, newMessage: message });
    chatSessionHistory.push({ role: 'user', text: message });
    chatSessionHistory.push({ role: 'model', text: data.text });

    // Return an async iterable that yields the single response chunk
    return {
      async *[Symbol.asyncIterator]() {
        yield data.text;
      }
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};