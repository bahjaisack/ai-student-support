import {
  clearSessionCookie,
  revokeAdminSession,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    await revokeAdminSession(request);

    const response = Response.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.headers.set("Set-Cookie", clearSessionCookie());

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);

    return Response.json(
      { success: false, error: "Unable to log out." },
      { status: 500 }
    );
  }
}