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

  // Get all metadata types for an org
  app.get("/api/metadata/:orgId/all", async (req, res) => {
    try {
      const { orgId } = req.params;
      const connection = await storage.getOrgConnection(orgId);

      if (!connection) {
        return res.status(404).json({ error: "Org not found" });
      }

      // Connect to Salesforce
      const conn = new jsforce.Connection({
        loginUrl: connection.instanceUrl
      });

      await conn.login(connection.username, connection.password);

      // Fetch metadata for each type
      const metadataTypes: MetadataType[] = ["Profile", "CustomObject", "CustomField", "ValidationRule"];
      const metadata: Record<string, any> = {};

      for (const type of metadataTypes) {
        try {
          // List metadata of this type
          const results = await conn.metadata.list([{ type }]);

          // Convert array to record for easier comparison
          metadata[type.toLowerCase() + 's'] = Array.isArray(results) 
            ? results.reduce((acc, item) => {
                acc[item.fullName] = item;
                return acc;
              }, {} as Record<string, any>)
            : { [results.fullName]: results };

        } catch (err) {
          console.error(`Error fetching ${type} metadata:`, err);
          metadata[type.toLowerCase() + 's'] = {};
        }
      }

      res.json(metadata);
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  return createServer(app);
}