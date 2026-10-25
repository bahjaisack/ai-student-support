
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/admin-session";

type RouteContext = {
  params: Promise<{ reference: string }>;
};
import type { Document } from "mongodb";

type SupportReply = {
  message: string;
  sender: "admin";
  createdAt: Date;
};

type SupportRequest = Document & {
  reference: string;
  replies?: SupportReply[];
  updatedAt?: Date;
};
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    // 1. Verify that the admin is logged in.
    const isAdmin = await verifyAdminSession(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    // 2. Validate the request reference.
    const { reference: rawReference } = await params;
    const reference = rawReference.trim().toUpperCase();

    if (!/^DS-[A-F0-9]{8}$/.test(reference)) {
      return NextResponse.json(
        { success: false, error: "Invalid request reference." },
        { status: 400 }
      );
    }

    // 3. Read and validate the reply.
    const body = await request.json();

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Reply must contain 1–5000 characters.",
        },
        { status: 400 }
      );
    }

    // 4. Connect to MongoDB.
    const client = await clientPromise;
    const db = client.db("dugsiiye_support");

    // 5. Save the reply to the matching support request.
 
const supportRequests = db.collection("support_requests");

const result = await supportRequests.updateOne(
  { reference },
  {
    $set: {
      updatedAt: new Date(),
    },
    $push: {
      replies: {
        message,
        sender: "admin",
        createdAt: new Date(),
      },
    },
  } as any
);


    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Support request not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reply saved successfully.",
    });
  } catch (error) {
    console.error("Admin reply error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to save the reply right now.",
      },
      { status: 500 }
    );
  }
}
