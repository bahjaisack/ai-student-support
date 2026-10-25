
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dugsiiye_support");

    await db.command({ ping: 1 });

    return Response.json({
      success: true,
      message: "MongoDB connected successfully!",
      database: db.databaseName,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return Response.json(
      {
        success: false,
        error: "Could not connect to MongoDB.",
      },
      { status: 500 }
    );
  }
}
