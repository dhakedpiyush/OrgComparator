import { OrgConnection, Metadata, InsertOrgConnection, InsertMetadata, MetadataType } from "@shared/schema";

export interface IStorage {
  saveOrgConnection(connection: InsertOrgConnection): Promise<OrgConnection>;
  getOrgConnection(orgId: string): Promise<OrgConnection | undefined>;
  saveMetadata(metadata: InsertMetadata): Promise<Metadata>;
  getMetadata(orgId: string, type: MetadataType): Promise<Metadata | undefined>;
}

export class MemStorage implements IStorage {
  private connections: Map<number, OrgConnection>;
  private metadataStore: Map<number, Metadata>;
  private currentConnectionId: number;
  private currentMetadataId: number;

  constructor() {
    this.connections = new Map();
    this.metadataStore = new Map();
    this.currentConnectionId = 1;
    this.currentMetadataId = 1;
  }

  async saveOrgConnection(connection: InsertOrgConnection): Promise<OrgConnection> {
    const id = this.currentConnectionId++;
    const orgConnection = { ...connection, id };
    this.connections.set(id, orgConnection);
    return orgConnection;
  }

  async getOrgConnection(orgId: string): Promise<OrgConnection | undefined> {
    return Array.from(this.connections.values()).find(conn => conn.orgId === orgId);
  }

  async saveMetadata(metadata: InsertMetadata): Promise<Metadata> {
    const id = this.currentMetadataId++;
    const storedMetadata = { ...metadata, id };
    this.metadataStore.set(id, storedMetadata);
    return storedMetadata;
  }

  async getMetadata(orgId: string, type: MetadataType): Promise<Metadata | undefined> {
    return Array.from(this.metadataStore.values()).find(
      m => m.orgId === orgId && m.type === type
    );
  }
}

export const storage = new MemStorage();
