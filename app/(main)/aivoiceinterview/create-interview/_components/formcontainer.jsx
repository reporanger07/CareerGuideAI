// "use client"
// import React from "react";
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useState } from "react";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";

// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import useFetch from "@/hooks/use-fetch";
// import { updateUser } from "@/actions/user";
// import { useForm } from "react-hook-form";



// const FormContainer = ({onHandleInputChange, GoToNext}) => {
//   return (
//     <div>
//       <Card className="w-full max-w-lg mt-10 mx-2">
//         <CardHeader>
//           <CardTitle className=" text-4xl">Enter Job Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div>
//             <h2 className="text-sm">Job Position</h2>
//             <Input placeholder="e.g Backend Developer"
//             className="mt-2"
//             onChange={(event)=>onHandleInputChange('jobPosition',event.target.value)} />

//           </div>
//           <div className="mt-5">
//             <h2 className="text-sm">Job Description</h2>
//             <Textarea placeholder="Enter your job description" className='h-[200px] mt-2'
//             onChange={(event)=>onHandleInputChange("jobDescription",event.target.value)} />
//           </div>
//           <div className="mt-5">
//       <h2 className="text-sm font-medium mb-2">Interview Duration</h2>

//       <Select onValueChange={(value)=>onHandleInputChange('Duration',value)}> 
//         <SelectTrigger className="w-full">
//           <SelectValue placeholder="Select Duration" />
//         </SelectTrigger>

//         <SelectContent>
//           <SelectItem value="15 ">15 min</SelectItem>
//           <SelectItem value="30">30 min</SelectItem>
//           <SelectItem value="45">45 min</SelectItem>
//           <SelectItem value="60">60 min</SelectItem>
//         </SelectContent>
//       </Select>
//     </div>

//         </CardContent>
//         <div className="w-full flex justify-center" onClick={()=>GoToNext()}>
//         <Button className=" cursor-pointer w-[90%]">Generate Interview</Button>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default FormContainer;

"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { generateQuestionsList } from "@/actions/aiinterview";

const FormContainer = ({ onQuestionsGenerated }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);

    const response = await generateQuestionsList(
      formData.jobPosition,
      formData.jobDescription,
      formData.Duration
    );

    const questions = response?.interviewQuestions || [];

    // 👇 FIX: Pass both questions AND formData
    onQuestionsGenerated(questions, formData);

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-4xl">Enter Job Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <Input 
          placeholder="Job Title: Backend Developer"
          onChange={(e) => handleChange("jobPosition", e.target.value)}
        />

        <Textarea
          placeholder="Paste job description..."
          className="h-[200px]"
          onChange={(e) => handleChange("jobDescription", e.target.value)}
        />

        <Select onValueChange={(value) => handleChange("Duration", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Interview Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 min</SelectItem>
            <SelectItem value="15">15 min</SelectItem>
            <SelectItem value="30">30 min</SelectItem>
            <SelectItem value="45">45 min</SelectItem>
            <SelectItem value="60">60 min</SelectItem>
          </SelectContent>
        </Select>

        <Button className="w-full" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            "Generate Interview"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormContainer;