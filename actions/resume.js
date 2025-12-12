"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
//import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });


const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function saveResume(content) {

    const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    
  });
  if (!user) throw new Error("user not found");


  try{
    const resume =await db.resume.upsert({
        where:{userId:user.id},
        update:{content,},
        create:{userId:user.id,content}

    })
    revalidatePath("/resume")
    return resume;
  } catch(error){
    console.error("error saving resume",error);
    throw new Error("Error saving resume");
  }
}

export async function getResume(){
    const {userId}=await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    const user=await db.user.findUnique({
        where:{clerkUserId:userId},
    });
    if(!user) throw new Error("user not found");

    return await db.resume.findUnique({
        where:{userId:user.id},
    })
}

export async function improveWithAI({current,type}){

     const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    
  });
  if (!user) throw new Error("user not found");


   const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;
    try{
        const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4000,
  temperature: 0.7,
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
});

const improvedResponse = response.content[0].text.trim();
return improvedResponse;
    }catch(error){
        console.error("error improving resume",error);
        throw new Error("Error improving resume");

    }

}


  
  
