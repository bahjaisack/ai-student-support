
import { randomUUID } from "node:crypto";
import clientPromise from "@/lib/mongodb";

const allowedCategories = [
  "course",
  "technical",
  "certificate",
  "account",
  "other",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const category =
      typeof body.category === "string" ? body.category : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (
      name.length < 2 ||
      name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !allowedCategories.includes(category) ||
      description.length < 10 ||
      description.length > 2000
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Enter a valid name, email, category, and description (10-2000 characters).",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dugsiiye_support");

    const reference = `DS-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase()}`;

    const supportRequest = {
      reference,
      name,
      email,
      category,
      description,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db
      .collection("support_requests")
      .insertOne(supportRequest);

    return Response.json(
      {
        success: true,
        message: "Your support request was submitted successfully.",
        reference,
        status: "open",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Support request error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to submit your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
