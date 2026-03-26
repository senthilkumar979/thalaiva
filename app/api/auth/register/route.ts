import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { isMongoConnectionError, mongoConnectionUserMessage } from "@/lib/dbErrors";
import { sendWelcomeEmail } from "@/lib/email";
import { User } from "@/models/User";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    await connectDb();
    const exists = await User.findOne({ email: parsed.data.email });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const isAdmin =
      !!process.env.ADMIN_SEED_EMAIL &&
      parsed.data.email.toLowerCase() === process.env.ADMIN_SEED_EMAIL.toLowerCase();
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: isAdmin ? "admin" : "user",
    });
    await sendWelcomeEmail(user.email, user.name).catch(() => undefined);
    return NextResponse.json({ ok: true, id: String(user._id) });
  } catch (e) {
    console.error(e);
    if (isMongoConnectionError(e)) {
      return NextResponse.json({ error: mongoConnectionUserMessage() }, { status: 503 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
