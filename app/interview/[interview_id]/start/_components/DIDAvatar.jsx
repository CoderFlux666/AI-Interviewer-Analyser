"use client";
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { toast } from 'sonner';

const DIDAvatar = forwardRef(({ onLoaded }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [streamId, setStreamId] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const videoRef = useRef(null);
    const pcRef = useRef(null);

    useImperativeHandle(ref, () => ({
        speak: async (text) => {
            if (!streamId || !sessionId) {
                console.warn("Avatar not ready to speak");
                return;
            }
            try {
                await fetch('/api/did', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'talk',
                        data: { streamId, sessionId, text }
                    })
                });
            } catch (e) {
                console.error("Failed to speak:", e);
            }
        }
    }));

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Create Peer Connection
                const pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                });
                pcRef.current = pc;
                setPeerConnection(pc);

                pc.ontrack = (event) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = event.streams[0];
                    }
                };

                pc.onicecandidate = async (event) => {
                    if (event.candidate && streamId && sessionId) {
                        await fetch('/api/did', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'ice-candidate',
                                data: { streamId, sessionId, candidate: event.candidate }
                            })
                        });
                    }
                };

                // 2. Create Stream
                const createResp = await fetch('/api/did', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'create-stream' })
                });
                const createData = await createResp.json();

                if (createData.error) throw new Error(createData.error);

                const { id: newStreamId, offer, session_id: newSessionId, ice_servers } = createData;
                setStreamId(newStreamId);
                setSessionId(newSessionId);

                // Update ICE servers if provided
                if (ice_servers && ice_servers.length > 0) {
                    pc.setConfiguration({ iceServers: ice_servers });
                }

                // 3. Set Remote Description
                await pc.setRemoteDescription(new RTCSessionDescription(offer));

                // 4. Create Answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                // 5. Send Answer
                await fetch('/api/did', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'start-stream',
                        data: { streamId: newStreamId, sessionId: newSessionId, answer }
                    })
                });

                setIsLoading(false);
                if (onLoaded) onLoaded();

            } catch (err) {
                console.error("D-ID Init Error:", err);
                toast.error("Failed to initialize Avatar: " + err.message);
                setIsLoading(false);
            }
        };

        init();

        return () => {
            // Cleanup
            if (streamId && sessionId) {
                fetch('/api/did', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'close',
                        data: { streamId, sessionId }
                    })
                }).catch(e => console.error("Close error", e));
            }
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, []); // Run once on mount

    return (
        <div className="w-full h-full relative bg-black rounded-lg overflow-hidden flex items-center justify-center">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
        </div>
    );
});

DIDAvatar.displayName = 'DIDAvatar';
export default DIDAvatar;
