import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Please provide a message to analyze." },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { error: "Message is too long." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are CyberGuard AI, a cybersecurity awareness assistant.

Analyze this message for possible:
- Phishing
- Smishing
- Banking scams
- Job scams
- Prize scams
- Impersonation
- Social engineering
- Credential theft
- Suspicious URLs
- Malware indicators

Return ONLY valid JSON using exactly this structure:

{
  "riskScore": 0,
  "verdict": "Very Safe",
  "threatType": "Safe",
  "confidence": 0,
  "summary": "Simple explanation",
  "indicators": [
    {
      "title": "Warning sign",
      "severity": "low",
      "explanation": "Why this may be suspicious"
    }
  ],
  "recommendedActions": [
    "Recommended action"
  ],
  "safeAlternative": "What the user should do instead"
}

Rules:
- riskScore must be between 0 and 100.
- confidence must be between 0 and 100.
- Do not claim a message is definitely safe.
- Do not invent external threat intelligence.
- Explain cybersecurity concepts simply.
- Never request passwords, OTPs, PINs, or other secrets.
- Base the analysis only on the supplied message.

Message:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Empty AI response");
    }

    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("CyberGuard AI error:", error);

    return NextResponse.json(
      {
        error: "Unable to analyze the message right now.",
      },
      { status: 500 }
    );
  }
}