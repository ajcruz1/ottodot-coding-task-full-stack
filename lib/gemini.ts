"use server";

import { GoogleGenAI, Type } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const modelName = "	gemini-2.0-flash";

export const generateMathProblem = async () => {
  const response = await client.models.generateContent({
    model: modelName,
    contents: `Create a simple math problem.`,
    config: {
      systemInstruction: `You are a teacher in Singapore who teaches Math to Primary 5 students.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problem_text: {
            type: Type.STRING,
          },
          final_answer: {
            type: Type.INTEGER,
          },
        },
        propertyOrdering: ["problem_text", "final_answer"],
      },
    },
  });

  return response.text;
};

export const generateFeedback = async (
  problem: string,
  answer: number,
  correctAnswer: number,
) => {
  const response = await client.models.generateContent({
    model: modelName,
    contents: `Generate feedback for your student based on this problem: ${problem}.
      And the student's answer ${answer}.
      The correct answer to problem: ${correctAnswer}`,
    config: {
      systemInstruction: `You are a teacher in Singapore who teaches Math to Primary 5 students.`,
    },
  });

  return response.text;
};
