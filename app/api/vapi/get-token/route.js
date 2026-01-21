import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET() {
    try {
        const privateKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPI_API_KEY;

        if (!privateKey) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        // 1. Get Org ID
        // Try /auth/me first (common convention)
        let orgId = null;
        try {
            const meRes = await axios.get('https://api.vapi.ai/auth/me', {
                headers: { Authorization: `Bearer ${privateKey}` }
            });
            orgId = meRes.data.orgId || meRes.data.id; // Adjust based on actual response
        } catch (e) {
            console.log("Auth/me failed, trying /assistant");
            // Fallback: List assistants
            const asstRes = await axios.get('https://api.vapi.ai/assistant', {
                headers: { Authorization: `Bearer ${privateKey}` }
            });
            if (asstRes.data && asstRes.data.length > 0) {
                orgId = asstRes.data[0].orgId;
            }
        }

        if (!orgId) {
            // If we still can't find it, maybe the key itself contains it? No.
            // Let's try one more: /org
            try {
                const orgRes = await axios.get('https://api.vapi.ai/org', {
                    headers: { Authorization: `Bearer ${privateKey}` }
                });
                orgId = orgRes.data.id || orgRes.data[0]?.id;
            } catch (e2) {
                console.error("Failed to find Org ID");
            }
        }

        if (!orgId) {
            return NextResponse.json({ error: 'Could not retrieve Org ID' }, { status: 500 });
        }

        // 2. Sign JWT
        const token = jwt.sign(
            {
                orgId: orgId,
                userId: orgId // Sometimes userId is needed too?
            },
            privateKey,
            { expiresIn: '1h' }
        );

        return NextResponse.json({ token, orgId });

    } catch (error) {
        console.error('Token generation failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
