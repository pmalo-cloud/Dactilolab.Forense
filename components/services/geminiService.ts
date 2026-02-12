import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const generateQuiz = async (topic: string, grade: string): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const forensicContext = `
    Eres un experto en Criminalística especializado en el Sistema Dactiloscópico Argentino de Juan Vucetich.
    Genera un cuestionario de 6 preguntas de nivel ${grade} sobre: "${topic}".
    Incluye explicaciones técnicas sobre tipos fundamentales (Arco, Presilla, Verticilo) y puntos característicos.
  `;

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

  try {
    return JSON.parse(response.text || '[]');
  } catch (error) {
    throw new Error("Error en la base de datos.");
  }
};
