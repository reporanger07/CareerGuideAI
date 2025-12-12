"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateQuestionsList = async (
  jobPosition,
  jobDescription,
  duration
) => {
  console.log("API Key present:", !!process.env.ANTHROPIC_API_KEY);
  console.log(
    "API Key starts with:",
    process.env.ANTHROPIC_API_KEY?.substring(0, 10)
  );
  // 🔹 Your prompt EXACTLY as written (no changes), only values inserted
  const QUESTION_PROMPT = `
You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:
Job Title: ${jobPosition}
Job Description: ${jobDescription}
Interview Duration: 5 Minutes
Interview Type: {Technical/Behavioral}

Your task:
Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {{type}} interview.

Format your response in JSON format with array list of questions.
format: interviewQuestions=[
{
question:"",
type:'Technical/Behavioral/Experience/Problem Solving/Leadership'
},{
...
}]

The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role.
`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 5000,
      temperature: 0.3,
      //response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: QUESTION_PROMPT,
        },
      ],
    });

    // Claude returns JSON text so we parse it
    let raw = response.output_text ?? response.content[0]?.text;
    raw = raw?.replace(/```json|```/g, "").trim();
    console.log("AI Question Generation Response:", raw);
    return JSON.parse(raw);
  } catch (error) {
    console.error("AI Question Generation Error:", error);
    return { error: "Failed to generate questions" };
  }
};

export async function saveVoiceInterview(formData, questions) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const saved = await db.voiceInterview.create({
      data: {
        userId: user.id,
        jobPosition: formData.jobPosition,
        jobDescription: formData.jobDescription,
        duration: parseInt(formData.Duration),
        questionsList: questions,
      },
    });
    console.log("DB Save Response:", saved);
    console.log("Saved Interview ID:", saved.id);
    return {
      status: "success",
      interviewId: saved.id,
    };
  } catch (error) {
    console.error("DB Save Error:", error);
    throw new Error("Failed to save interview session");
  }
}

export async function getInterviewById(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const interview = await db.voiceInterview.findUnique({
      where: { id },
    });

    if (!interview || interview.userId !== user.id) {
      throw new Error("Interview not found or does not belong to user");
    }
    console.log(
      "getInterviewById response of wuestions:",
      interview.questionsList
    );

    return interview;
  } catch (err) {
    console.error("❌ getInterviewById Error:", err);
    return null;
  }
}
export async function generateFeedback(conversation) {
  console.log("Generating feedback for conversation:", conversation);

  try {
    conversation = JSON.parse(conversation);
  } catch (e) {
    console.error("Failed to parse conversation JSON:", e);
  }

  const formattedConversation = Array.isArray(conversation)
    ? conversation.map(msg => `${msg.role}: ${msg.content}`).join("\n")
    : conversation;

  const FEEDBACK_PROMPT = ` ${formattedConversation}
${formattedConversation}

You are an expert technical interviewer. Analyze the above interview conversation between the Assistant (interviewer) and the User (candidate).

Your task:
1. Evaluate the candidate strictly based on their spoken answers in the conversation.
2. Give ratings out of 10 in the following categories:
   - technicalSkills
   - communication
   - problemSolving
   - experience
3. Write a clear and concise 3-line summary of the candidate’s performance.
4. Provide:
   - "Recommendation": either "Selected" or "Not Selected"
   - "RecommendationMsg": a one-sentence explanation for your choice
5. Suggest **one most recommended skill** the candidate should learn to improve for this role.

Very Important Instructions:
- Only use information from the conversation. Do NOT invent details.
- If a category cannot be evaluated due to missing answers, give a score of 0.
- Output MUST be valid JSON. No markdown. No extra text.

Return JSON in exactly the following structure:

{
  "feedback": {
    "rating": {
      "technicalSkills": 0,
      "communication": 0,
      "problemSolving": 0,
      "experience": 0
    },
    "summary": "",
    
    "recommendedSkill": ""
  }
}
`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 5000,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: FEEDBACK_PROMPT,
        },
      ],
    });

    let raw = response.output_text ?? response.content[0]?.text;
    return raw;

  } catch (error) {
    console.error("AI Question Generation Error:", error);
    return { error: "Failed to generate questions" };
  }
}




export async function saveInterviewFeedback(interviewId, feedback) {
  try {
    const saved = await db.voiceInterview.update({
      where: { id: interviewId },
      data: {
        feedback: typeof feedback === "string" 
          ? feedback
          : JSON.stringify(feedback, null, 2),
      },
    });
    console.log("Feedback saved successfully:", saved);
    return { success: true, saved };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false, error };
  }
}


export async function getUserVoiceInterviews() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return [];

  const interviews = await db.voiceInterview.findMany({
    where: {
      user: {
        clerkUserId: clerkId, // Direct filtering using clerkId
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return interviews;
}