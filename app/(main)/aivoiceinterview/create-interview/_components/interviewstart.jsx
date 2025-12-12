// import React, { useState } from "react";
// import { Loader2 } from "lucide-react";
// import { generateQuestionsList } from "@/actions/aiinterview";

// const QuestionsList = ({ formData }) => {
//   const [loading, setLoading] = useState(false);
//   const [questions, setQuestions] = useState([]);

//   const handleGenerate = async () => {
//     setLoading(true);

//     const response = await generateQuestionsList(
//       formData.jobPosition,
//       formData.jobDescription,
//       formData.Duration
//     );

//     setQuestions(response?.interviewQuestions || []);
//     setLoading(false);
//   };
//   return (
//     <div>
//       {loading && 
//     <div className='p-5 bg-blue-50 rounded-xl'>
//       <Loader2Icon className='animate-spin' />
//       <div>
//         <h2>Generating Interview</h2>
        
//       </div>
//     </div>
//   }
  
//     </div>
//   )
// }

// export default QuestionsList

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { saveVoiceInterview } from "@/actions/aiinterview";

const InterviewStart = ({ formData, questions }) => {
  const router = useRouter();
  const [loading,setLoading]=useState(false);

  const handleStart = async () => {
    setLoading(true);
    
    const result = await saveVoiceInterview(formData, questions); 

    console.log("Save Result:", result);

    if (result?.interviewId) {
      router.push(`/aivoiceinterview/${result.interviewId}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-16 px-3">
      <div className="bg-[#111111] border border-gray-800 rounded-2xl px-8 py-10 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        
        <h2 className="text-white font-semibold text-lg">Interview Ready</h2>

        <p className="text-gray-400 text-sm mt-1">
          Your AI-powered voice interview has been generated based on your job preferences.
        </p>

        <h1 className="text-3xl font-bold text-white mt-6 leading-snug">
          {formData?.jobPosition || "Job Role"} Interview
        </h1>

        <p className="text-gray-400 mt-3">
          Duration: <span className="text-white font-medium">{formData?.Duration} minutes</span>
        </p>

        <div className="flex justify-between items-center mt-10">
          <Button variant="outline" className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500">
            View Summary
          </Button>

          <Button
            onClick={handleStart}
            disabled={loading}
            className="bg-gray-300 text-black hover:bg-gray-400 cursor-pointer"
          >
            {loading ? "Starting..." : "Start Interview"}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default InterviewStart;
