import { getGemini } from "./gemini";

export async function embedText(text: string): Promise<number[]> {
  const ai = getGemini();
  const result = await ai.models.embedContent({
    model: "gemini-embedding-exp-03-07",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });
  // EmbedContentResponse returns embeddings[] (array of ContentEmbedding)
  return result.embeddings?.[0]?.values ?? [];
}
