"use client";

import React, { useEffect, useState } from "react";
import { getInterviewById } from "@/actions/aiinterview";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeedBack({ params }) {
  const { id } = React.use(params);

  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getInterviewById(id);
      setInterview(data);

      if (data?.feedback) {
        try {
          let raw = data.feedback;

          console.log("RAW FEEDBACK:", raw); // debug

          // Remove ```json and ```
          raw = raw.replace(/```json|```/g, "").trim();

          // Remove any text before first `{`
          const firstBrace = raw.indexOf("{");
          if (firstBrace > -1) raw = raw.substring(firstBrace);

          const parsed = JSON.parse(raw);
          setFeedback(parsed);
        } catch (err) {
          console.error("Invalid JSON in feedback", err);
        }
      }
    };

    fetchData();
  }, [id]);

  if (!feedback) {
    return (
      <div className="text-center text-xl mt-20 text-gray-400">
        Loading feedback...
      </div>
    );
  }

  const rating = feedback.feedback.rating;

  return (
    <div className="flex flex-col items-center mt-10 px-5">
      <h1 className="text-3xl font-bold mb-10 text-white">Interview Feedback</h1>

      <div className="w-full md:w-[80%] flex flex-col gap-10">
        
        {/* Ratings */}
        <Card className="bg-[#111] border border-gray-800 p-6 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Candidate Ratings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {Object.entries(rating).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <span>{value} / 10</span>
                </div>
                <Progress value={(value / 10) * 100} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-[#111] border border-gray-800 p-6 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Interview Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              {feedback.feedback.summary}
            </p>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="bg-[#111] border border-gray-800 p-6 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Final Recommendation
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="text-lg font-bold text-red-400">
              {feedback.feedback.recommendation.status}
            </p>
            <p className="text-gray-300">
              {feedback.feedback.recommendation.message}
            </p>

            <h3 className="font-semibold text-white mt-4">Recommended Skill:</h3>
            <p className="text-blue-400">{feedback.feedback.recommendedSkill}</p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center mt-10 relative z-50">
  <Link href={`/aivoiceinterview`}>
    <Button className="px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 cursor-pointer">
      Back to Interview Dashboard
    </Button>
  </Link>
</div>

      </div>
    </div>
  );
}
