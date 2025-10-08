'use client'

import { useState } from 'react'
import { FaSpinner } from "react-icons/fa";

interface MathProblem {
  problem_text: string
  final_answer: number
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateProblem = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/math-problem", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setProblem(data.problem);
        setSessionId(data.session_id);
      } else {
        console.error("Failed to generate problem")
      }
    } catch (error) {
      console.error("Error generating problem:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('api/math-problem/submit', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          answer: userAnswer,
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsCorrect(data.isCorrect);
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Error submitting answer and generating feedback. ", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="flex flex-col container p-5 gap-4">
        <div className="flex w-full flex-row gap-4 justify-between items-center">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Math Problem Generator
          </h1>
        
          <button
            onClick={generateProblem}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex gap-2 items-center">
                <FaSpinner className="animate-spin"/>
                Generating...
              </div>) : ('Generate New Problem')} 
          </button>
        </div>

        {problem && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Problem:</h2>
            <p className="text-lg text-gray-800 leading-relaxed mb-6">
              {problem.problem_text}
            </p>
              
            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer"
                  required
                />
              </div>
                
              <button
                type="submit"
                disabled={!userAnswer || isLoading || isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                {isSubmitting ? (
                  <div className="flex gap-2 items-center">
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </div>) : "Submit Answer"}
              </button>
            </form>
          </div>
        )}

        {feedback && (
          <div className={`rounded-lg shadow-lg p-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
            </h2>
            <p className="text-gray-800 leading-relaxed">{feedback}</p>
          </div>
        )}
      </main>
    </div>
  )
}