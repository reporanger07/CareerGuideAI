"use client";

import { useEffect, useState } from "react";
import { getUserVoiceInterviews } from "@/actions/aiinterview";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function AiVoiceInterviewDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getUserVoiceInterviews();
      setInterviews(data);
    }
    load();
  }, []);

  const openFeedback = (feedback) => {
    if (!feedback) return;
    try {
      const cleaned = feedback.replace(/```json|```/g, "").trim();
      setFeedbackData(JSON.parse(cleaned));
      setOpen(true);
    } catch (err) {
      console.error("Invalid JSON feedback:", err, feedback);
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-10 pt-24 text-white flex flex-col items-center">
      <Card className="bg-neutral-900 border-neutral-800 w-full max-w-6xl mx-auto mb-12 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Voice Interviews</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <p className="mb-5 text-lg">
            Real-time voice interviews with instant performance insights.
          </p>

          <Link href="/aivoiceinterview/create-interview">
            <Button className="bg-blue-600 hover:bg-blue-700 px-6">
              Start Interview
            </Button>
          </Link>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold text-center mb-8 w-full">
        Recent Interviews
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl w-full mx-auto pb-20">
        {interviews.map((iv) => (
          <Card key={iv.id} className="bg-neutral-900 border-neutral-800 shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="capitalize text-xl font-semibold">
                {iv.jobPosition}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">Duration:</strong> {iv.duration} Minutes
              </p>

              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">Date:</strong>{" "}
                {new Date(iv.createdAt).toLocaleDateString()}
              </p>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => openFeedback(iv.feedback)}
              >
                View Feedback
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-900 text-white max-w-3xl h-[60vh] overflow-y-auto border border-neutral-700 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Interview Feedback
            </DialogTitle>
          </DialogHeader>

          {feedbackData ? (
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold mb-4">Ratings</h3>
                {Object.entries(feedbackData.feedback.rating).map(
                  ([label, value]) => (
                    <div key={label} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">
                          {label.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span>{value} / 10</span>
                      </div>
                      <Progress value={value * 10} className="h-2" />
                    </div>
                  )
                )}
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Summary</h3>
                <p className="text-gray-300 leading-relaxed">
                  {feedbackData.feedback.summary}
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">
                  Final Recommendation
                </h3>

                <p
                  className={`font-semibold ${
                    feedbackData.feedback.recommendation?.status.toLowerCase() ===
                    "selected"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {feedbackData.feedback.recommendation?.status}
                </p>

                <p className="text-gray-300 leading-relaxed">
                  {feedbackData.feedback.recommendation?.message}
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Recommended Skill</h3>
                <p className="text-blue-400 font-medium">
                  {feedbackData.feedback.recommendedSkill}
                </p>
              </section>
            </div>
          ) : (
            <p>No feedback available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
