import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertOrgConnectionSchema, insertMetadataSchema, MetadataType } from "@shared/schema";
import jsforce from "jsforce";

export async function registerRoutes(app: Express) {
  app.post("/api/org/connect", async (req, res) => {
    try {
      const connection = insertOrgConnectionSchema.parse(req.body);

      // Verify connection with Salesforce
      const conn = new jsforce.Connection({
        instanceUrl: connection.instanceUrl,
        accessToken: connection.accessToken
      });

      // Get org ID from Salesforce
      const userInfo = await conn.identity();
      const orgId = userInfo.organization_id;

      const savedConnection = await storage.saveOrgConnection({
        ...connection,
        orgId
      });

      res.json(savedConnection);
    } catch (error) {
      console.error('Connection error:', error);
      res.status(400).json({ error: "Failed to connect to Salesforce org" });
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
      console.error('Metadata save error:', error);
      res.status(400).json({ error: "Invalid metadata" });
    }
  });

  app.get("/api/metadata/:orgId/:type", async (req, res) => {
    try {
      const { orgId, type } = req.params;
      const validType = type as MetadataType;

      const connection = await storage.getOrgConnection(orgId);
      if (!connection) {
        return res.status(404).json({ error: "Org not found" });
      }

      const conn = new jsforce.Connection({
        instanceUrl: connection.instanceUrl,
        accessToken: connection.accessToken
      });

      const metadata = await conn.metadata.read(validType);
      res.json(metadata);
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  return createServer(app);
}