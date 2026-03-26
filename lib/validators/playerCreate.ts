import { z } from "zod";

/** 24-char hex ObjectId (client-safe; no mongoose in browser bundle). */
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export const playerCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  franchise: z.string().min(1, "Choose a franchise").regex(OBJECT_ID_REGEX, "Invalid franchise"),
  tier: z.union([z.literal(1), z.literal(3), z.literal(5)]),
  role: z.enum(["bat", "bowl", "allrounder", "wk"]),
});

export type PlayerCreatePayload = z.infer<typeof playerCreateSchema>;

/** Form uses string tier from `<select>` before coercion. */
export const playerCreateFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  franchiseId: z.string().min(1, "Choose a franchise").regex(OBJECT_ID_REGEX, "Invalid franchise"),
  tier: z.enum(["1", "3", "5"], { message: "Select a tier" }),
  role: z.enum(["bat", "bowl", "allrounder", "wk"]),
});

export type PlayerCreateFormValues = z.infer<typeof playerCreateFormSchema>;

export function toPlayerCreatePayload(values: PlayerCreateFormValues): PlayerCreatePayload {
  return {
    name: values.name,
    franchise: values.franchiseId,
    tier: Number(values.tier) as 1 | 3 | 5,
    role: values.role,
  };
}
