"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from "next/navigation"
import { useUser } from "@/app/provider"
import { supabase } from '@/services/supabaseClient';
import InterviewDetail from './_components/InterviewDetail';
import CandidateList from './_components/CandidateList';

function InterviewDetails() {
    const { interview_id } = useParams();
    const { user } = useUser();
    const [interviewDetail, setInterviewDetail] = useState();

    useEffect(() => {
        user && GetInterviewDetails();
    }, [user])

    const GetInterviewDetails = async () => {
        try {
            // 1. Fetch Interview Details
            // Corrected column names: duration instead of interviewDuration, type instead of types
            const { data: interviewData, error: interviewError } = await supabase
                .from("Interviews")
                .select("jobPosition, type, jobDescription, questionList, created_at, duration, interview_id")
                .eq("userEmail", user?.email)
                .eq("interview_id", interview_id)
                .single();

            if (interviewError) {
                console.error("Error fetching interview:", interviewError);
                return;
            }

            // 2. Fetch Feedback for this interview
            const { data: feedbackData, error: feedbackError } = await supabase
                .from("interview-feedback")
                .select("userEmail,userName,feedback,created_at,recommended")
                .eq("interview_id", interview_id);

            if (feedbackError) {
                console.error("Error fetching feedback:", feedbackError);
            }

            // 3. Merge and map columns for UI compatibility
            const combinedData = {
                ...interviewData,
                interviewDuration: interviewData.duration, // Map duration to interviewDuration
                types: interviewData.type, // Map type to types
                "interview-feedback": feedbackData || []
            };

            console.log("Combined Data:", combinedData);
            setInterviewDetail(combinedData);
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    }

    return (
        <div className="mt-5">
            <h2 className="font-bold text-2xl ">Interview Details</h2>
            <InterviewDetail interviewDetail={interviewDetail} />
            <CandidateList detail={interviewDetail?.['interview-feedback']} />
        </div>
    )
}

export default InterviewDetails