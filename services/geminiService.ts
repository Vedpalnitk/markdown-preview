import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const summarizeText = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing. Please configure process.env.API_KEY";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following markdown text into a concise bulleted list, maintaining the markdown format: \n\n${text}`,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary.";
  }
};

export const polishMarkdown = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Refine the following text to be better structured Markdown. 
      - Fix any broken LaTeX math syntax (ensure using $ for inline and $$ for block).
      - Improve headings and spacing.
      - Do not change the core meaning.
      - Return ONLY the markdown.
      
      Input:
      ${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Return original on error
  }
};