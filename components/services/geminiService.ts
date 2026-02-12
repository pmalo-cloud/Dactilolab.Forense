import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const generateQuiz = async (topic: string, grade: string): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING: La clave de Google Gemini no está configurada en Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const forensicContext = `
    Eres un profesor de Criminalística. Genera un examen técnico sobre: ${topic}.
    Nivel: ${grade}.
    Responde ÚNICAMENTE con un array JSON de 6 objetos.
    Cada objeto debe tener: id, question, options (array de 4), correctIndex (0-3) y explanation.
    Usa terminología del Sistema Dactiloscópico Argentino.
    No incluyas markdown ni texto adicional, solo el JSON.
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
    if (!text) throw new Error("EMPTY_RESPONSE: La IA no devolvió contenido.");
    
    // Limpieza de posibles etiquetas markdown si la IA las añade por error
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Detalle técnico del error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("CLAVE_INVALIDA: La API Key configurada no es válida.");
    }
    throw new Error(`FALLO_SISTEMA: ${error.message || "Error desconocido en la conexión forense"}`);
  }
};
    return JSON.parse(response.text || '[]');
  } catch (error) {
    throw new Error("Error en la base de datos.");
  }
};
