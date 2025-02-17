import { OrgConnection, InsertOrgConnection } from "@shared/schema";

// In-memory storage for org connections
interface StoredConnection extends OrgConnection {
  username: string;
}

const connections: StoredConnection[] = [];

export const storage = {
  saveOrgConnection: async (connection: any): Promise<StoredConnection> => {
    const storedConnection = {
      ...connection,
      username: connection.username
    };
    connections.push(storedConnection);
    return storedConnection;
  },

  getAllConnections: async (): Promise<OrgConnection[]> => {
    return connections;
  }
};