"use client";
import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar, { AvatarQuality, StreamingEvents } from '@heygen/streaming-avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function HeyGenAvatar({ interviewInfo, onCallEnd, onUserSpeechStart, onUserSpeechEnd }) {
    const [stream, setStream] = useState(null);
    const [debug, setDebug] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);
    const avatar = useRef(null);
    const mediaStream = useRef(null);
    const videoRef = useRef(null);

    async function startSession() {
        setIsLoading(true);
        setErrorDetails(null);
        try {
            const response = await fetch('/api/get-heygen-token');
            const data = await response.json();

            if (!data.token) {
                throw new Error("Could not fetch HeyGen token");
            }

            avatar.current = new StreamingAvatar({
                token: data.token,
            });

            avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
                console.log("Stream ready:", event.detail);
                if (videoRef.current) {
                    videoRef.current.srcObject = event.detail;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().catch(console.error);
                    };
                }
            });

            avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
                console.log("Avatar started talking", e);
            });

            avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
                console.log("Avatar stopped talking", e);
            });

            avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
                console.log("Stream disconnected");
                endSession();
            });

            avatar.current.on(StreamingEvents.USER_START, (e) => {
                if (onUserSpeechStart) onUserSpeechStart();
            });

            avatar.current.on(StreamingEvents.USER_STOP, (e) => {
                if (onUserSpeechEnd) onUserSpeechEnd();
            });

            // Minimal configuration to debug 400 error
            // Using Low quality and Angela
            await avatar.current.createStartAvatar({
                quality: AvatarQuality.Low,
                avatarName: 'Angela-inT-20220820',
                // No voice, no knowledgebase, no language - ABSOLUTE MINIMUM
            });

            await avatar.current.startVoiceChat({
                useSilencePrompt: false
            });

            console.log("Session started");
            toast("🚀 Interview Started");

        } catch (error) {
            console.error("Failed to start HeyGen session:", error);
            let errMsg = error.message;
            if (error.response) {
                try {
                    const errData = await error.response.json();
                    console.error("Error response:", errData);
                    errMsg = JSON.stringify(errData, null, 2);
                } catch (e) {
                    console.error("Could not parse error response");
                }
            }
            setErrorDetails(errMsg);
            toast.error("Failed to start AI Avatar");
        } finally {
            setIsLoading(false);
        }
    }

    async function endSession() {
        if (avatar.current) {
            await avatar.current.stopAvatar();
            avatar.current = null;
        }
        if (onCallEnd) onCallEnd();
        setStream(null);
    }

    useEffect(() => {
        startSession();

        return () => {
            if (avatar.current) {
                avatar.current.stopAvatar();
            }
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            {isLoading && <div className="absolute z-20 text-white bg-black/50 p-2 rounded">Loading Avatar...</div>}

            {/* Error Display Overlay */}
            {errorDetails && (
                <div className="absolute z-30 bg-red-900/90 text-white p-4 rounded max-w-[90%] overflow-auto max-h-[80%] font-mono text-xs text-left">
                    <strong>Error Details:</strong><br />
                    <pre className="whitespace-pre-wrap">{errorDetails}</pre>
                </div>
            )}

            <div className="w-full h-full bg-black rounded-lg overflow-hidden" id="avatar-container">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}
