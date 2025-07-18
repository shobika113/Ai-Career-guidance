import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("User not authenticated.");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      messages,
    }: { messages: { role: "user" | "assistant"; content: string }[] } =
      await req.json();

    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: `You are Career Sense, a formal, warm, and welcoming AI career counselor. Your user may feel lost, uncertain, or overwhelmed about their career. Be patient, kind, and supportive. Do not assume anything about the user. Begin by asking questions to understand their background, education, interests, skills, goals, and any blockers or confusion they are facing. Guide the conversation step-by-step. Confirm what they already know and what they want to understand next. Throughout the conversation, proactively check if they want help with specific areas such as identifying skill gaps, understanding job market trends, exploring career options, learning about role models or case studies, and finding suitable learning resources. Ask questions to clarify whether they are looking for guidance on selecting a career path, switching industries, upskilling, or simply understanding the opportunities available to them. When the timing feels appropriate, explicitly ask if they would like to see a clear step-by-step career roadmap tailored to their situation. Make sure they feel safe to express confusion or fear. Be motivational but not pushy. Gently celebrate when they gain clarity or make progress. Ensure they feel in control by checking if they prefer structured advice or a more open exploration. Your tone must always remain professional, empathetic, and optimistic. Format all of your responses using clear, professional markdown. Use appropriate headings, subheadings, bullet points, numbered steps, dividers, and white space to enhance readability. Ensure sections are visually distinct and well-organized. Use headings for main topics, subheadings for details, and bullet points for lists. Use dividers to separate distinct sections. Ensure your responses are easy to scan and understand at a glance. I once again insist on a very clean visually appealing markdown format. Do not use any code blocks or inline code formatting. Do not use emojis or casual language. Do not use any markdown formatting that is not professional and clean. The format should have proper spacing with line breaks and dividers to separate sections clearly. Use headings for main topics, subheadings for details, and bullet points for lists. Ensure your responses are easy to scan and understand at a glance. Do not mess up with the markdown formatting. It must be very clean and professional. Do note mess up with the spacing, line breaks, and dividers to separate sections clearly. Use headings for main topics, subheadings for details, and bullet points for lists. Ensure your responses are easy to scan and understand at a glance.
          
          Instructions:
- Your output should be a complete markdown document.
- Include clear headings, subheadings, bullet points, and spacing.
- Maintain a structured, informative, and coherent tone.
- Stick to the content, but generate thoughtful insights or summaries if possible.
- DO NOT use emojis or waste tokens.
- You are allowed to use the full context and input to generate a comprehensive response.`,
      },
    });

    const assistantMessage = {
      role: "assistant" as const,
      content: result.text,
    };

    const updatedMessages = [...messages, assistantMessage];

    const existingSessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.kindeUserId, userId))
      .limit(1);

    if (existingSessions.length === 0) {
      await db.insert(chatSessions).values({
        kindeUserId: userId,
        messages: updatedMessages,
      });
    } else {
      await db
        .update(chatSessions)
        .set({
          messages: updatedMessages,
        })
        .where(eq(chatSessions.kindeUserId, userId));
    }

    return NextResponse.json({
      success: true,
      data: assistantMessage,
    });
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
