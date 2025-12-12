"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Always use db.user (lowercase) — matches Prisma client convention
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry is not unique in schema, replace with findFirst:
        // let industryInsight = await tx.industryInsight.findFirst({ where: { industry: data.industry } });

        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            name: data.name,
            bio: data.bio,
            experience: data.experience,
            skills: data.skills, // Make sure skills column is String[] or Json in schema
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
      }
    );

    return { success: true, ...result };
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw new Error("Error updating profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    // If no user record in DB yet → treat as not onboarded
    if (!user) {
      return { isOnboarded: false };
    }

    return {
      isOnboarded: !!user.industry, // true if industry exists, false otherwise
    };
  } catch (error) {
    console.error("Error getting user onboarding status:", error);
    throw new Error("Error getting user onboarding status");
  }
}

//--------------------------------------------------------------
export async function getDbUser() {
  const { userId } = auth(); // Clerk userId

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  return user;
}