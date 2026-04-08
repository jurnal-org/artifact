import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!client) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not set");
    }
    client = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
  }
  return client;
}

export async function chatWithGemini(
  systemPrompt: string,
  messages: { role: "user" | "model"; content: string }[]
): Promise<string> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.8,
      topP: 0.95,
      responseMimeType: "application/json",
    },
  });
  return response.text ?? "";
}

export async function generateClosure(
  systemPrompt: string,
  transcript: string
): Promise<string> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: transcript }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.5,
      responseMimeType: "application/json",
    },
  });
  return response.text ?? "";
}
