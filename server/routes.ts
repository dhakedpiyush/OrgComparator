import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertOrgConnectionSchema, insertMetadataSchema, MetadataType } from "@shared/schema";
import jsforce from "jsforce";

export async function registerRoutes(app: Express) {
  app.post("/api/org/connect", async (req, res) => {
    try {
      const connection = insertOrgConnectionSchema.parse(req.body);

      // Create Salesforce connection using username-password flow
      const conn = new jsforce.Connection({
        loginUrl: connection.instanceUrl
      });

      // Login with username and password
      await conn.login(connection.username, connection.password);

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

  app.get("/api/metadata/:orgId/:type", async (req, res) => {
    try {
      const { orgId, type } = req.params;
      const validType = type as MetadataType;

      const connection = await storage.getOrgConnection(orgId);
      if (!connection) {
        return res.status(404).json({ error: "Org not found" });
      }

      // Reconnect to Salesforce using stored credentials
      const conn = new jsforce.Connection({
        loginUrl: connection.instanceUrl
      });

      await conn.login(connection.username, connection.password);

      // Fetch metadata using jsforce metadata API
      const metadata = await conn.metadata.read(validType, '*');
      res.json(metadata);
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  return createServer(app);
}