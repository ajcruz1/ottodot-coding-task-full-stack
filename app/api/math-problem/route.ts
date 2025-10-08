import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { client, modelName } from "../../../lib/gemini";

export async function POST() {
  try {
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

    const problem = JSON.parse(response.text);

    const { data: session, error } = await supabase
      .from("math_problem_sessions")
      .insert([
        {
          problem_text: problem["problem_text"],
          correct_answer: problem["final_answer"],
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      problem: {
        problem_text: session.problem_text,
        final_answer: session.correct_answer,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to generate problem" },
      { status: 500 },
    );
  }
}
