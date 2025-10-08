import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";
import { client, modelName } from "../../../../lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answer } = await request.json();

    const { data: problem, error } = await supabase
      .from("math_problem_sessions")
      .select()
      .eq("id", sessionId)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: "Math problem not found" },
        { status: 404 },
      );
    }

    const response = await client.models.generateContent({
      model: modelName,
      contents: `
          Generate feedback for your student based on this problem: ${problem.problem_text}.
          And the student's answer ${answer}.
          The correct answer to the problem: ${problem.correct_answer}`,
      config: {
        systemInstruction: `
          You are a teacher in Singapore who teaches Math to Primary 5 students.
          Show the student how to solve the given problem regardless if the student got it right or wrong.
          Highlight key concepts that are used for the problem.
          Keep your response as short as possible.
          Remove any unnecessary symbols from your response.`,
      },
    });

    const feedback = response.text;

    const { data, error: insertError } = await supabase
      .from("math_problem_submissions")
      .insert([
        {
          session_id: sessionId,
          user_answer: answer,
          is_correct: answer === problem.correct_answer.toString(),
          feedback_text: feedback,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error saving feedback to database: ", error);
    }

    return NextResponse.json({
      success: true,
      isCorrect: data.is_correct,
      feedback: data.feedback_text,
      correctAnswer: problem.correct_answer,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Error submitting answer" },
      { status: 500 },
    );
  }
}
