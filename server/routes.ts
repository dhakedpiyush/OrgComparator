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

      try {
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
      } catch (loginError) {
        console.error('Login error:', loginError);
        res.status(401).json({ error: "Invalid Salesforce credentials" });
      }
    } catch (error) {
      console.error('Connection error:', error);
      res.status(400).json({ error: "Failed to connect to Salesforce org" });
    }
  });

  // Get metadata for source org
  app.get("/api/metadata/source/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const validType = type as MetadataType;

      // Get the first connected org as source
      const connections = await storage.getAllConnections();
      const sourceConnection = connections[0];

      if (!sourceConnection) {
        return res.status(404).json({ error: "Source org not connected" });
      }

      // Reconnect to Salesforce
      const conn = new jsforce.Connection({
        loginUrl: sourceConnection.instanceUrl
      });

      await conn.login(sourceConnection.username, sourceConnection.password);

      // Fetch metadata using jsforce metadata API
      const metadata = await conn.metadata.list([{ type: validType }]);
      res.json(metadata);
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  // Get metadata for target org
  app.get("/api/metadata/target/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const validType = type as MetadataType;

      // Get the second connected org as target
      const connections = await storage.getAllConnections();
      const targetConnection = connections[1];

      if (!targetConnection) {
        return res.status(404).json({ error: "Target org not connected" });
      }

      // Reconnect to Salesforce
      const conn = new jsforce.Connection({
        loginUrl: targetConnection.instanceUrl
      });

      await conn.login(targetConnection.username, targetConnection.password);

      // Fetch metadata using jsforce metadata API
      const metadata = await conn.metadata.list([{ type: validType }]);
      res.json(metadata);
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  return createServer(app);
}