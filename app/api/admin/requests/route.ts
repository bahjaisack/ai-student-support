import clientPromise from "@/lib/mongodb";
import { verifyAdminSession } from "@/lib/admin-session";

export async function GET(request: Request) {
  if (!(await verifyAdminSession(request))) {
    return Response.json(
      { success: false, error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("dugsiiye_support");

    const requests = await db
      .collection("support_requests")
      .find(
        {},
        {
          projection: {
            _id: 0,
            reference: 1,
            name: 1,
            email: 1,
            category: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return Response.json({ success: true, requests });
  } catch (error) {
    console.error("Admin requests error:", error);

    return Response.json(
      { success: false, error: "Unable to load support requests." },
      { status: 500 }
    );
  }
}