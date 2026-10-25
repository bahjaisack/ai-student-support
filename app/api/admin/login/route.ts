import { timingSafeEqual } from "node:crypto";
import {
  createAdminSession,
  createSessionCookie,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD is not configured.");

      return Response.json(
        { success: false, error: "Admin login is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const password =
      typeof body.password === "string" ? body.password : "";

    const submitted = Buffer.from(password);
    const expected = Buffer.from(adminPassword);

    const valid =
      submitted.length === expected.length &&
      timingSafeEqual(submitted, expected);

    if (!valid) {
      return Response.json(
        { success: false, error: "Invalid password." },
        { status: 401 }
      );
    }

    const token = await createAdminSession();

    const response = Response.json({
      success: true,
      message: "Admin login successful.",
    });

    response.headers.set("Set-Cookie", createSessionCookie(token));

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return Response.json(
      { success: false, error: "Unable to log in. Please try again." },
      { status: 500 }
    );
  }
}
