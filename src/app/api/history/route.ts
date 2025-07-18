import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.kindeUserId, userId))
      .limit(1);

    const session = sessions[0];

    return NextResponse.json({
      success: true,
      messages: session?.messages || [],
    });
  } catch (error) {
    console.error("[CHAT_HISTORY_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
