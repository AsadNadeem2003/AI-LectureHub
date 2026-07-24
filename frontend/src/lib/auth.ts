"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface UserPayload {
  id: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  name: string;
}

const TOKEN_NAME = "lecturehub_token";

export async function setToken(token: string) {
  (await cookies()).set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getToken() {
  return (await cookies()).get(TOKEN_NAME)?.value;
}

export async function clearToken() {
  (await cookies()).delete(TOKEN_NAME);
}

export async function requireAuth() {
  const token = await getToken();
  if (!token) {
    redirect("/login");
  }
  return token;
}

export async function logout() {
  await clearToken();
  redirect("/login");
}
