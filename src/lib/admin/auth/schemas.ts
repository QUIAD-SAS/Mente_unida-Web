import { z } from "zod";

const noBlank = (value: string) => value.trim().length > 0;

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El usuario es requerido")
    .refine(noBlank, "El usuario no puede estar vacío"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .refine(noBlank, "La contraseña no puede estar vacía"),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
