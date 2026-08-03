import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().trim().min(1, "Loginni kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
  remember: z.boolean().optional(),
});
