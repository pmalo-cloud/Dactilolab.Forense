import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "./types";

export const generateQuiz = async (topic: string, grade: string): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "") {
    throw new Error("API_KEY no detectada. Configúrala en Vercel (Environment Variables).");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const forensicContext = `
    Eres un profesor de Criminalística experto en el Sistema Dactiloscópico Argentino (Vucetich).
    Genera un examen técnico sobre: ${topic}.
    Nivel: ${grade}.
    Responde ÚNICAMENTE con un array JSON de 6 objetos.
    Cada objeto: id, question, options (4), correctIndex (0-3), explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: forensicContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctIndex", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sin respuesta de la IA.");
    return JSON.parse(text);
  } catch (error: any) {
    throw new Error(`Error en el peritaje digital: ${error.message}`);
  }
};
