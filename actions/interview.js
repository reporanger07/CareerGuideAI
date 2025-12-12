"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
//import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-pro",
// });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  try {
    const prompt = `
Generate 10 technical interview questions for a ${user.industry} professional${
      user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    };

Each question should be multiple choice with 4 options.

Return the response in this JSON format only, no additional text:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}   `

    const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: prompt,
      },

    ],
    //response_format: { type: "json_object" },
  });
    const text = response.content[0].text;

    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const quiz = JSON.parse(cleanedText);
    return quiz.questions;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate quiz");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: answers[index] === q.correctAnswer,
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;
  let wrongQuestionsText = "";

  if (wrongAnswers.length > 0) {
    wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question:"${q.question}"\nCorrect Answer:"${q.answer}"\nUser Answer:"${q.userAnswer}"`
      )
      .join("\n\n");
  }

  const improvementPrompt = `
The user got the following ${user.industry} technical interview questions wrong:

${wrongQuestionsText}

Based on these mistakes, provide a concise, specific improvement tip.
Focus on the knowledge gaps revealed by these wrong answers.
Keep the response under 2 sentences and make it encouraging.
Don't explicitly mention the mistakes, instead focus on what to learn/practice.
`;

  try {
    const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: improvementPrompt,
      },
    ],
  });
    improvementTip = response.content[0].text.trim();

  } catch (error) {
    console.error("Error generating improvement tip:", error);
  }

  try{
    const assessment=await db.assessment.create({
        data:{
            userId:user.id,
            quizScore:score,
            questions:questionResults,
            category:"Technical",
            improvementTip,
        }
    })
    return assessment;
  }catch(error){
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }

}


export async function getAssessments(){

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found")

    try{
      const assignments=await db.assessment.findMany({
        where:{
          userId:user.id},
          orderBy:{createdAt:"asc"},
        });
        return assignments;
    }catch(error){
      console.error("Error fetching assignments:", error);
      throw new Error("Failed to fetch assignments");
    }

}
