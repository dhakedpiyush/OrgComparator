import { z } from "zod";

export const connectionSchema = z.object({
  username: z.string(),
  password: z.string(),
  orgType: z.enum(["production", "sandbox"])
});

export type MetadataType = "Profile" | "CustomObject" | "CustomField" | "ValidationRule";

export type ConnectionFormData = z.infer<typeof connectionSchema>;