// "use client";
// import { getInterviewById } from "@/actions/aiinterview";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import Vapi from "@vapi-ai/web";
// import { use, useState, useEffect, useRef } from "react";
// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import Image from "next/image";
// import { TimerReset, TimerIcon } from "lucide-react";
// import { Mic, PhoneOff } from "lucide-react";
// import { toast } from "sonner";
// import { generateFeedback } from "@/actions/aiinterview";

// export default function InterviewPage({ params }) {
//   const { id } = use(params);

//   const [interview, setInterview] = useState(null);
//   const [vapi, setVapi] = useState(null);
//   const [activeUser, setActiveUser] = useState(false);
//   //const [conversation, setConversation] = useState([]);
//   const conversationRef = useRef([]);
//   useEffect(() => {
//     const instance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
//     setVapi(instance);
//   }, []);

//   // Attach Vapi event listeners AFTER vapi is initialized
//   useEffect(() => {
//     if (!vapi) return;

//     const handleSpeechStart = () => {
//       console.log("Speech started");
//       setActiveUser(false);
//     };

//     const handleSpeechEnd = () => {
//       console.log("Speech ended");
//       setActiveUser(true);
//     };

//     const handleCallStart = () => {
//       console.log("Call started");
//       toast("Interview Started...");
//     };

//   //   const handleCallEnd = async () => {
//   //     console.log("call ended");
//   //     toast("Interview Ended.");

//   //     // Wait so React updates state fully
//   //     setTimeout(async () => {
//   //       console.log("Final Conversation:", conversation);

//   //       const result = await generateFeedback(JSON.stringify(conversation));
//   //       console.log("Feedback Result:", result);
//   //     }, 300);
//   //   };

//   //  const handleMessage = (message) => {
//   //     if (!message?.conversation) return;

//   //     // Format A → message.conversation is array
//   //     // Format B → message.conversation.messages is array
//   //     const rawMessages = Array.isArray(message.conversation)
//   //       ? message.conversation
//   //       : message.conversation.messages || [];

//   //     const cleaned = rawMessages.map((msg) => ({
//   //       role: msg.role,
//   //       content: msg.message,
//   //     }));

//   //     console.log("New Clean Conversation:", cleaned);
//   //     setConversation(cleaned);
//   //   };
//   const handleMessage = (message) => {
//   if (!message?.conversation) return;

//   const raw = Array.isArray(message.conversation)
//     ? message.conversation
//     : message.conversation.messages || [];

//   const cleaned = raw.map(msg => ({
//     role: msg.role,
//     content: msg.message
//   }));

//   console.log("New Clean Conversation:", cleaned);

//   conversationRef.current = cleaned; // ⭐ ALWAYS PERSIST
// };

// const handleCallEnd = async () => {
//   console.log("call ended");
//   toast("Interview Ended.");

//   setTimeout(async () => {
//     console.log("Final Conversation:", conversationRef.current);

//     const result = await generateFeedback(
//       JSON.stringify(conversationRef.current)
//     );

//     console.log("Feedback Result:", result);
//   }, 300);
// };

//     vapi.on("speech-start", handleSpeechStart);
//     vapi.on("speech-end", handleSpeechEnd);
//     vapi.on("call-start", handleCallStart);
//     vapi.on("call-end", handleCallEnd);
//     vapi.on("message", handleMessage);

//     // Cleanup on unmount
//     return () => {
//       vapi.off("speech-start", handleSpeechStart);
//       vapi.off("speech-end", handleSpeechEnd);
//       vapi.off("call-start", handleCallStart);
//       vapi.off("call-end", handleCallEnd);
//     };
//   }, [vapi]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getInterviewById(id);
//       setInterview(data);
//     };
//     fetchData();
//   }, [id]);

//   useEffect(() => {
//     if (interview && vapi) {
//       startCall();
//     }
//   }, [interview, vapi]);

//   const startCall = () => {
//     let questionList = "";

//     interview.questionsList.forEach((item, index) => {
//       questionList = questionList + "," + item.question;
//     });

//     const assistantOptions = {
//       name: "AI Recruiter",
//       firstMessage: `Hi, how are you? Ready for your interview on ${interview.jobPosition}?`,

//       transcriber: {
//         provider: "deepgram",
//         model: "nova-2",
//         language: "en-US",
//       },
//       voice: {
//         provider: "playht",
//         voiceId: "jennifer",
//       },
//       model: {
//         provider: "openai",
//         model: "gpt-4",
//         messages: [
//           {
//             role: "system",
//             content: `
// You are an AI voice assistant conducting interviews.
// Your job is to ask candidates provided interview questions, assess their responses.

// Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
// "Hey there! Welcome to your ${interview.jobPosition} interview. Let’s get started with a few questions!"

// Ask one question at a time and wait for the candidate’s response before proceeding. Keep the questions clear and concise. Below are the questions ask one by one:
// Questions: {${questionList}}

// If the candidate struggles, offer hints or rephrase the question without giving away the answer.
// Provide brief, encouraging feedback after each answer.

// End on a positive note:
// "Thanks for chatting! Hope to see you crushing projects soon!"

// Key Guidelines:
// ✔ Be friendly, engaging, and witty 🎙️
// ✔ Keep responses short and natural
// ✔ Adapt based on the candidate’s confidence level
// ✔ Ensure the interview remains focused on React
//             `.trim(),
//           },
//         ],
//       },
//     };

//     vapi.start(assistantOptions);
//   };
//   const stopInterview = () => {
//     vapi.stop();
//   };
//   // vapi.on("speech-start",()=>{
//   //   console.log("Speech started");
//   //   setActiveUser(false);

//   // })
//   // vapi.on("call-start",()=>{
//   //   console.log("Call started");
//   //   toast('Interview Started....');
//   // })
//   // vapi.on("speech-end",()=>{
//   //   console.log("Speech ended");
//   //   setActiveUser(true);
//   // })
//   // vapi.on("call-end",()=>{
//   //   console.log("Call ended");
//   //   toast('Interview Ended.');
//   // })

//   if (!interview) {
//     return (
//       <div className="text-center text-red-400 mt-20 text-xl">
//         ❌ Interview not found or unauthorized.
//       </div>
//     );
//   }

//   return (
//     <div className="p-20 lg:px-48 xl:px-56">
//       <h2 className="font-bold text-xl flex justify-between">
//         AI Interview Session
//         <span className="flex gap-2 items-center">
//           <TimerReset />
//           00:00:00
//         </span>
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-5">
//         {/* Ava Card */}
//         <Card className="h-[400px] flex items-center justify-center">
//           <div className="relative flex items-center justify-center">
//             {!activeUser && (
//               <span className="absolute h-24 w-24 rounded-full bg-blue-500 opacity-50 animate-ping"></span>
//             )}
//             <h2 className="text-xl bg-primary text-black rounded-full h-24 w-24 flex items-center justify-center relative z-10">
//               Ava
//             </h2>
//           </div>
//         </Card>

//         {/* You Card */}
//         <Card className="h-[400px] flex items-center justify-center">
//           <div className="relative flex items-center justify-center">
//             {activeUser && (
//               <span className="absolute h-24 w-24 rounded-full bg-blue-500 opacity-50 animate-ping"></span>
//             )}
//             <h2 className="text-xl bg-primary text-black rounded-full h-24 w-24 flex items-center justify-center relative z-10">
//               You
//             </h2>
//           </div>
//         </Card>
//       </div>

//       <div className="flex items-center gap-5 justify-center mt-7">
//         <Mic className="h-12 w-12 p-3 bg-gray-500 text-white rounded-full cursor-pointer" />
//         <PhoneOff
//           onClick={stopInterview}
//           className="h-12 w-12 p-3 bg-red-500 text-white rounded-full cursor-pointer"
//         />
//       </div>

//       <h2 className="text-sm text-gray-400 text-center mt-5">
//         Interview in Progress...
//       </h2>
//     </div>
//   );
// }

"use client";
import { getInterviewById } from "@/actions/aiinterview";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Vapi from "@vapi-ai/web";
import { use, useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { TimerReset, TimerIcon } from "lucide-react";
import { Mic, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { generateFeedback } from "@/actions/aiinterview";
import { saveInterviewFeedback } from "@/actions/aiinterview";
export default function InterviewPage({ params }) {
  const { id } = use(params);

  const [interview, setInterview] = useState(null);
  const [vapi, setVapi] = useState(null);
  const [activeUser, setActiveUser] = useState(false);
  const conversationRef = useRef([]);
  const callStartedRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    const instance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
    setVapi(instance);

    return () => {
      // Cleanup on unmount
      if (instance) {
        instance.stop();
      }
    };
  }, []);

  // Attach Vapi event listeners
  useEffect(() => {
    if (!vapi) return;

    const handleSpeechStart = () => {
      console.log("Speech started");
      setActiveUser(false);
    };

    const handleSpeechEnd = () => {
      console.log("Speech ended");
      setActiveUser(true);
    };

    const handleCallStart = () => {
      console.log("Call started");
      toast("Interview Started...");
      // Clear conversation at start
      conversationRef.current = [];
    };

    const handleMessage = (message) => {
      console.log("Message:", message.type);

      if (message.type === "conversation-update" && message.conversation) {
        const cleaned = message.conversation
          .filter((msg) => msg.role !== "system") // Remove system prompts
          .map((msg) => ({
            role: msg.role === "bot" ? "assistant" : msg.role,
            content: msg.content,
          }));

        console.log(" Updated conversation:", cleaned.length, "messages");
        conversationRef.current = cleaned;
        return;
      }

      if (message.conversation?.messages) {
        const cleaned = message.conversation.messages
          .filter((msg) => msg.role !== "system")
          .map((msg) => ({
            role: msg.role === "bot" ? "assistant" : msg.role,
            content: msg.message || msg.content,
          }));

        console.log(
          " Updated conversation (legacy):",
          cleaned.length,
          "messages"
        );
        conversationRef.current = cleaned;
      }
    };

   const handleCallEnd = async () => {
  console.log("call ended");
  toast("Interview Ended.");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const finalConversation = conversationRef.current;
  console.log("Final Conversation:", finalConversation);

  if (!finalConversation || finalConversation.length === 0) {
    toast.error("No conversation data captured. Please try again.");
    console.error("Conversation is empty!");
    return;
  }

  try {
    const result = await generateFeedback(
      JSON.stringify(finalConversation)
    );

    await saveInterviewFeedback(id, result);
    console.log("Feedback Result:", result);

    toast.success("Feedback generated successfully!");

    // ✅ Redirect to feedback page
    router.push(`/interview/${id}/feedback`);

  } catch (error) {
    console.error("Error generating feedback:", error);
    toast.error("Failed to generate feedback");
  }
};


    const handleError = (error) => {
      console.error(" error:", error);
    };

    // Register event listeners
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    // Cleanup on unmount
    return () => {
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, [vapi]);

  // Fetch interview data
  useEffect(() => {
    const fetchData = async () => {
      const data = await getInterviewById(id);
      setInterview(data);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (interview && vapi && !callStartedRef.current) {
      callStartedRef.current = true;
      startCall();
    }
  }, [interview, vapi]);

  const startCall = () => {
    let questionList = "";

    interview.questionsList.forEach((item, index) => {
      questionList = questionList + "," + item.question;
    });

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi, how are you? Ready for your interview on ${interview.jobPosition}?`,

      // Request conversation updates from Vapi
      clientMessages: [
        "transcript",
        "hang",
        "function-call",
        "speech-update",
        "metadata",
        "conversation-update",
      ],

      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `
You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.

Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your ${interview.jobPosition} interview. Let's get started with a few questions!"

Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below are the questions ask one by one:
Questions: {${questionList}}

If the candidate struggles, offer hints or rephrase the question without giving away the answer.
Provide brief, encouraging feedback after each answer.

End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"

Key Guidelines:
✔ Be friendly, engaging, and witty 🎙️
✔ Keep responses short and natural
✔ Adapt based on the candidate's confidence level
✔ Ensure the interview remains focused on the role
            `.trim(),
          },
        ],
      },
    };

    vapi.start(assistantOptions);
  };

  const stopInterview = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  if (!interview) {
    return (
      <div className="text-center text-red-400 mt-20 text-xl">
        ❌ Interview not found or unauthorized.
      </div>
    );
  }

  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview Session
        <span className="flex gap-2 items-center">
          <TimerReset />
          00:00:00
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-5">
        {/* Ava Card */}
        <Card className="h-[400px] flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {!activeUser && (
              <span className="absolute h-24 w-24 rounded-full bg-blue-500 opacity-50 animate-ping"></span>
            )}
            <h2 className="text-xl bg-primary text-black rounded-full h-24 w-24 flex items-center justify-center relative z-10">
              Ava
            </h2>
          </div>
        </Card>

        {/* You Card */}
        <Card className="h-[400px] flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {activeUser && (
              <span className="absolute h-24 w-24 rounded-full bg-blue-500 opacity-50 animate-ping"></span>
            )}
            <h2 className="text-xl bg-primary text-black rounded-full h-24 w-24 flex items-center justify-center relative z-10">
              You
            </h2>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-5 justify-center mt-7">
        <Mic className="h-12 w-12 p-3 bg-gray-500 text-white rounded-full cursor-pointer" />
        <PhoneOff
          onClick={stopInterview}
          className="h-12 w-12 p-3 bg-red-500 text-white rounded-full cursor-pointer"
        />
      </div>

      <h2 className="text-sm text-gray-400 text-center mt-5">
        Interview in Progress...
      </h2>
    </div>
  );
}
