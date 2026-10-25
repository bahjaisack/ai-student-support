import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const reference =
      typeof body.reference === "string"
        ? body.reference.trim().toUpperCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (
      !/^DS-[A-F0-9]{8}$/.test(reference) ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return Response.json(
        {
          success: false,
          error: "Enter a valid reference and email.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dugsiiye_support");

    const supportRequest = await db
      .collection("support_requests")
      .findOne(
        { reference, email },
        {
          projection: {
            _id: 0,
            reference: 1,
            category: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            replies: 1,
          },
        }
      );

    if (!supportRequest) {
      return Response.json(
        {
          success: false,
          error:
            "No matching request found. Check your reference and email.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      request: {
        ...supportRequest,
        replies: supportRequest.replies ?? [],
      },
    });
  } catch (error) {
    console.error("Track request error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to check your request right now.",
      },
      { status: 500 }
    );
  }
}
