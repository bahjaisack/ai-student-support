import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/admin-session";

const allowedStatuses = ["open", "in progress", "resolved"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reference: string }> }
) {
  if (!(await verifyAdminSession(request))) {
    return Response.json(
      { success: false, error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  try {
    const { reference } = await context.params;
    const normalizedReference = reference.toUpperCase();

    if (!/^DS-[A-F0-9]{8}$/.test(normalizedReference)) {
      return Response.json(
        { success: false, error: "Invalid request reference." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status =
      typeof body.status === "string" ? body.status : "";

    if (!allowedStatuses.includes(status)) {
      return Response.json(
        { success: false, error: "Invalid status." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dugsiiye_support");

    const result = await db.collection("support_requests").updateOne(
      { reference: normalizedReference },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { success: false, error: "Support request not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Request status updated successfully.",
      reference: normalizedReference,
      status,
    });
  } catch (error) {
    console.error("Update request status error:", error);

    return Response.json(
      { success: false, error: "Unable to update request status." },
      { status: 500 }
    );
  }
}