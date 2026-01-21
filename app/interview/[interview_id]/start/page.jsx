"use client";
import React, { useContext, useEffect, useState } from 'react';
import { InterviewDataContext } from '@/context/InterviewDataContext';
import { Button } from '@/components/ui/button';
import { Phone } from "lucide-react";
import Image from "next/image";
import TimerComponent from './_components/TimerCmponent';
import { toast } from 'sonner';
import axios from 'axios';
import { supabase } from './../../../../services/supabaseClient';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Vapi from '@vapi-ai/web';

// Initialize Vapi with the user's validated Public Key from the screenshot
// We hardcode it here to eliminate any .env loading issues
const vapiPublicKey = "d08904a8-722d-4c5c-ac3c-883bb9768e03";
const vapi = new Vapi(vapiPublicKey);

function StartInterview() {
  const { interviewInfo } = useContext(InterviewDataContext);
  const [activeUser, setActiveUser] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [conversation, setConversation] = useState([]);
  const { interview_id } = useParams();
  const router = useRouter();

  // Use ref to track the active Vapi instance
  const vapiRef = React.useRef(vapi);

  useEffect(() => {
    // Debugging
    console.log("✅ Vapi initialized with Public Key:", vapiPublicKey);

    // Attach listeners to the default instance initially
    const attachListeners = (instance) => {
      instance.on('call-start', () => {
        console.log('Call started');
        setIsInterviewActive(true);
        toast("🚀 Interview Started");
      });

      instance.on('call-end', () => {
        console.log('Call ended');
        onCallEnd();
      });

      instance.on('speech-start', () => {
        console.log('Speech started');
        setActiveUser(true);
      });

      instance.on('speech-end', () => {
        console.log('Speech ended');
        setActiveUser(false);
      });

      instance.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setConversation(prev => [...prev, {
            role: message.role,
            content: message.transcript
          }]);
        }
      });

      instance.on('error', (e) => {
        console.error("Vapi Error:", e);
        const msg = e.message || e.error || JSON.stringify(e);
        // Don't show toast for "ejection" if it's just a normal end, but usually it's an error.
        if (!msg.includes("ejection")) {
          toast.error("Connection Error: " + msg);
        } else {
          console.warn("Ejection detected. This might be due to credits or key limits.");
        }
      });
    };

    attachListeners(vapiRef.current);

    return () => {
      vapiRef.current.stop();
      vapiRef.current.removeAllListeners();
    };
  }, []);

  const startCall = async () => {
    try {
      // Ensure any previous session is stopped
      vapiRef.current.stop();

      toast("Connecting to Jennifer...");

      const assistantOptions = {
        name: "AI Recruiter",
        firstMessage: "Hello, I am your AI recruiter. Welcome to the interview. Shall we begin?",
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
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an interviewer for the ${interviewInfo?.jobPosition || 'role'}. Keep it professional and concise.`
            }
          ]
        }
      };

      console.log("🚀 Starting Vapi call with Jennifer...");
      await vapiRef.current.start(assistantOptions);

    } catch (e) {
      console.error("❌ Failed to start call:", e);
      toast.error("Failed to start interview. Check console.");
    }
  };

  const stopInterview = () => {
    vapiRef.current.stop();
    onCallEnd();
  };

  const onCallEnd = () => {
    setIsInterviewActive(false);
    toast("✅ Interview Ended");
    GenerateFeedback();
  };

  const GenerateFeedback = async () => {
    try {
      const mockConversation = conversation || [];
      const result = await axios.post('/api/ai-feedback', { conversation: mockConversation });
      const Content = result.data.content;
      const jsonMatch = Content.match(/\{[\s\S]*\}/);
      const FINAL_CONTENT = jsonMatch ? jsonMatch[0] : Content.replace('```json', '').replace('```', '');

      const { error } = await supabase
        .from("interview-feedback")
        .insert([{
          userName: interviewInfo?.userName || 'Unknown',
          userEmail: interviewInfo?.userEmail || 'Unknown',
          interview_id: interview_id,
          feedback: JSON.parse(FINAL_CONTENT),
          recommended: false
        }]);

      if (error) throw error;
      toast("✅ Feedback Generated");
      router.replace('/interview/' + interview_id + '/completed');
    } catch (err) {
      console.error("Feedback failed:", err);
      toast("❌ Failed to generate feedback");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100 relative overflow-hidden">
      {/* Subtle Background Patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-100/40 blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex justify-between items-center sticky top-0 z-50 supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center gap-3">
          <img src="/veritas_logo.png" alt="VeritasAI" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:block">
            <TimerComponent isInterviewActive={isInterviewActive} />
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 shadow-sm">
            <User size={18} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

        <div className="text-center mb-12 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Interview Session
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
            Professional AI-driven candidate assessment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
          {/* AI Agent Card */}
          <div className={`relative group transition-all duration-500 ${isInterviewActive && !activeUser ? 'scale-105' : 'hover:scale-[1.02]'}`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2rem] opacity-20 group-hover:opacity-40 blur transition duration-500" />
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-[1.8rem] p-10 flex flex-col items-center justify-center gap-8 h-[420px]">

              <div className="relative">
                {isInterviewActive && !activeUser && (
                  <>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping" />
                    <span className="absolute -inset-4 rounded-full border border-blue-100 animate-pulse" />
                  </>
                )}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10">
                  <img
                    src="https://img.freepik.com/free-photo/young-business-woman-working-laptop-office_1303-21060.jpg?t=st=1733816768~exp=1733820368~hmac=567554900762464016e7894a46b6807a99279796987c06830595d2d0c5a274d8&w=996"
                    alt="AI Recruiter"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-1 right-1 z-20">
                  <div className={`h-4 w-4 rounded-full border-2 border-white ${isInterviewActive && !activeUser ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-slate-800">Jennifer</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  AI Recruiter
                </span>
              </div>

              <div className="h-6 flex items-center justify-center w-full">
                {isInterviewActive && !activeUser ? (
                  <div className="flex gap-1 items-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                    <span className="ml-2 text-sm font-medium text-blue-500">Speaking...</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 font-medium">Ready to speak</span>
                )}
              </div>
            </div>
          </div>

          {/* User Card */}
          <div className={`relative group transition-all duration-500 ${activeUser ? 'scale-105' : 'hover:scale-[1.02]'}`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-[2rem] opacity-20 group-hover:opacity-40 blur transition duration-500" />
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-[1.8rem] p-10 flex flex-col items-center justify-center gap-8 h-[420px]">

              <div className="relative">
                {activeUser && (
                  <>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-20 animate-ping" />
                    <span className="absolute -inset-4 rounded-full border border-violet-100 animate-pulse" />
                  </>
                )}
                <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-inner flex items-center justify-center relative z-10">
                  <span className="text-4xl font-bold text-slate-400">
                    {interviewInfo?.userName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="absolute bottom-1 right-1 z-20">
                  <div className={`h-4 w-4 rounded-full border-2 border-white ${activeUser ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-slate-800">{interviewInfo?.userName || 'Candidate'}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">
                  Applicant
                </span>
              </div>

              <div className="h-6 flex items-center justify-center w-full">
                {activeUser ? (
                  <div className="flex gap-1 items-center">
                    <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce" />
                    <span className="ml-2 text-sm font-medium text-violet-500">Listening...</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 font-medium">Listening...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-16 flex items-center justify-center gap-6">
          {!isInterviewActive ? (
            <Button
              onClick={startCall}
              className="group relative px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3 text-lg font-semibold">
                <span>Start Interview</span>
                <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
            </Button>
          ) : (
            <Button
              onClick={stopInterview}
              variant="destructive"
              className="group px-8 py-6 bg-white border-2 border-red-100 hover:border-red-200 text-red-600 hover:bg-red-50 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span>End Session</span>
                <MicOff className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
