import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export type UserRole = "CUSTOMER" | "PROFESSIONAL" | "ADMIN" | "SUPER_ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string | null;
  professionalProfileId?: string;
}

const COOKIE_NAME = "worksy_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    // Token holds JSON session or ID
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8")) as SessionUser;

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      include: {
        professionalProfile: { select: { id: true } },
      },
    });

    if (!user || user.status !== "ACTIVE") return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      avatarUrl: user.avatarUrl,
      professionalProfileId: user.professionalProfile?.id,
    };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  const token = Buffer.from(JSON.stringify(user)).toString("base64");
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
