import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orgConnections = pgTable("org_connections", {
  id: serial("id").primaryKey(),
  instanceUrl: text("instance_url").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  orgType: text("org_type", { enum: ["production", "sandbox"] }).notNull(),
  orgId: text("org_id").notNull(),
});

export const metadata = pgTable("metadata", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  type: text("type").notNull(),
  data: jsonb("data").notNull()
});

export const insertOrgConnectionSchema = createInsertSchema(orgConnections).omit({ id: true });
export const insertMetadataSchema = createInsertSchema(metadata).omit({ id: true });

export type InsertOrgConnection = z.infer<typeof insertOrgConnectionSchema>;
export type InsertMetadata = z.infer<typeof insertMetadataSchema>;
export type OrgConnection = typeof orgConnections.$inferSelect;
export type Metadata = typeof metadata.$inferSelect;

export type MetadataType = "profiles" | "objects" | "fields" | "validationRules" | "customSettings" | "customMetadata";