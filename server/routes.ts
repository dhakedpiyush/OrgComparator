import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertOrgConnectionSchema, insertMetadataSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/org/connect", async (req, res) => {
    try {
      const connection = insertOrgConnectionSchema.parse(req.body);
      const savedConnection = await storage.saveOrgConnection(connection);
      res.json(savedConnection);
    } catch (error) {
      res.status(400).json({ error: "Invalid connection data" });
    }
  });

  app.get("/api/org/:orgId", async (req, res) => {
    const connection = await storage.getOrgConnection(req.params.orgId);
    if (connection) {
      res.json(connection);
    } else {
      res.status(404).json({ error: "Org not found" });
    }
  });

  app.post("/api/metadata", async (req, res) => {
    try {
      const metadata = insertMetadataSchema.parse(req.body);
      const saved = await storage.saveMetadata(metadata);
      res.json(saved);
    } catch (error) {
      res.status(400).json({ error: "Invalid metadata" });
    }
  });

  app.get("/api/metadata/:orgId/:type", async (req, res) => {
    const { orgId, type } = req.params;
    const metadata = await storage.getMetadata(orgId, type);
    if (metadata) {
      res.json(metadata);
    } else {
      res.status(404).json({ error: "Metadata not found" });
    }
  });

  return createServer(app);
}
