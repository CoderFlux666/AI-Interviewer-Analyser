import OpenAI from "openai";
import { NextResponse } from "next/server";
import { QUESTIONS_PROMPT } from "@/services/Constants";

export async function POST(req) {
  const { jobPosition, jobDescription, duration, type } = await req.json();
  const FINAL_PROMPT = QUESTIONS_PROMPT.replace("{{jobTitle}}", jobPosition)
    .replace("{{jobDescription}}", jobDescription)
    .replace("{{duration}}", duration)
    .replace("{{type}}", type);

  console.log(FINAL_PROMPT);

  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    console.log("API Key length:", process.env.OPENROUTER_API_KEY?.length);
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [{ role: "user", content: FINAL_PROMPT }],
    });
    console.log(completion.choices[0].message);
    return NextResponse.json(completion.choices[0].message);
  } catch (err) {
    console.error("Error in API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Example logic (not complete code, but shows the concept)
async function fetchWithRetry(apiKey, FINAL_PROMPT, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Your existing openai.chat.completions.create call goes here
      const completion = await openai.chat.completions.create({
        // ... settings
      });
      return completion; // Success!
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        // Calculate exponential backoff time (e.g., 2^i * 1000 milliseconds)
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(
          `429 error received. Retrying in ${delay / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // If it's a different error or we've run out of retries, throw
        throw error;
      }
    }
  }
}

// In your POST function, you would call:
// const completion = await fetchWithRetry(openai, FINAL_PROMPT);
