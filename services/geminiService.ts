
import { GoogleGenAI } from "@google/genai";

export const getCreativeDescription = async (productName: string): Promise<string> => {
  try {
    // Verificación ultra-segura de la API Key
    let apiKey: string | undefined;
    
    try {
      apiKey = process.env.API_KEY;
    } catch (e) {
      apiKey = undefined;
    }
    
    if (!apiKey) {
      console.warn("Dolce Fusión: API Key no detectada. Usando descripción genérica.");
      return "Una deliciosa bebida tradicional preparada con el toque secreto de Dolce Fusión.";
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres un experto en marketing gastronómico venezolano. Escribe una frase corta (máximo 12 palabras) y muy irresistible para vender: ${productName}. Debe sonar artesanal y delicioso.`,
    });
    
    return response.text || "La bebida más refrescante del evento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sabor venezolano auténtico en cada sorbo.";
  }
};
