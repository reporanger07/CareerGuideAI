// "use client";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft } from "lucide-react";
// import React from "react";
// import Link from "next/link";
// import FormContainer from "./_components/formcontainer";
// import { useState } from "react";
// import QuestionsList from "./_components/QuestionsList";
// const CreateInterview = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState();
//   const onHandleInputChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };
//   console.log(formData);
//   return (
//     <div className="container mx-auto space-y-4 p-6 mt-20">
      
//       {step === 1 && (
//         <FormContainer
//           onHandleInputChange={onHandleInputChange}
//           GoToNext={() => setStep(step + 1)}
//         />
//       )}

//       {step === 2 && <QuestionsList formData={formData} />}
//     </div>
//   );
// };

// export default CreateInterview;


"use client";
import { useState } from "react";
import FormContainer from "./_components/formcontainer";
import InterviewStart from "./_components/interviewstart";

const CreateInterview = () => {

  // ⬇️ make sure THIS exists before using formData
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(1);

  const handleQuestionsGenerated = (generatedQuestions, userFormData) => {
    setQuestions(generatedQuestions);
    setFormData(userFormData); // save the data
    setStep(2); // move to interview start page
  };

  return (
    <div className="container mx-auto p-6 mt-20">

      {step === 1 && (
        <FormContainer
          onQuestionsGenerated={handleQuestionsGenerated}
          formData={formData}          // now valid
          setFormData={setFormData}    // pass setter too
        />
      )}

      {step === 2 && (
        <InterviewStart 
          formData={formData} 
          questions={questions}
        />
      )}
    </div>
  );
};

export default CreateInterview;
