import clientPromise from "@/lib/mongodb";

export async function GET() {
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
            category: 1,
            status: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return Response.json({ success: true, requests });
  } catch (error) {
    console.error("Read requests error:", error);

    return Response.json(
      { success: false, error: "Could not read support requests." },
      { status: 500 }
    );
  }
}