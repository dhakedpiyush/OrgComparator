# Salesforce Metadata Comparison Tool

## Core Components

### 1. Data Schema (shared/schema.ts)
```typescript
import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orgConnections = pgTable("org_connections", {
  id: serial("id").primaryKey(),
  instanceUrl: text("instance_url").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  orgType: text("org_type", { enum: ["production", "sandbox"] }).notNull(),
  orgId: text("org_id")
});

export const metadata = pgTable("metadata", {
  id: serial("id").primaryKey(),
  orgId: text("org_id").notNull(),
  type: text("type", { enum: ["Profile", "CustomObject", "CustomField", "ValidationRule"] }).notNull(),
  data: jsonb("data").notNull()
});

export type MetadataType = "Profile" | "CustomObject" | "CustomField" | "ValidationRule";
```

### 2. Salesforce API Utilities (client/src/lib/salesforce.ts)
```typescript
import jsforce from "jsforce";
import { MetadataType } from "@shared/schema";

export async function createConnection(loginUrl: string, username: string, password: string) {
  try {
    const conn = new jsforce.Connection({ loginUrl });
    await conn.login(username, password);
    await conn.identity();
    return conn;
  } catch (error) {
    console.error('Connection error:', error);
    throw new Error('Failed to connect to Salesforce');
  }
}

export async function fetchMetadata(conn: jsforce.Connection, type: MetadataType) {
  try {
    const metadata = await conn.metadata.list([{ type }]);
    return Array.isArray(metadata) ? metadata.reduce((acc, item) => {
      acc[item.fullName] = item;
      return acc;
    }, {} as Record<string, any>) : { [metadata.fullName]: metadata };
  } catch (error) {
    console.error(`Error fetching ${type} metadata:`, error);
    throw new Error(`Failed to fetch ${type} metadata`);
  }
}

export async function compareMetadata(source: Record<string, any>, target: Record<string, any>) {
  const differences = [];
  const allKeys = new Set([...Object.keys(source), ...Object.keys(target)]);

  for (const key of allKeys) {
    const sourceItem = source[key];
    const targetItem = target[key];

    if (!sourceItem) {
      differences.push({
        name: key,
        status: 'missing_in_source',
        targetValue: targetItem
      });
      continue;
    }

    if (!targetItem) {
      differences.push({
        name: key,
        status: 'missing_in_target',
        sourceValue: sourceItem
      });
      continue;
    }

    const propertyDiffs = compareProperties(sourceItem, targetItem);
    if (propertyDiffs.length > 0) {
      differences.push({
        name: key,
        status: 'different',
        differences: propertyDiffs
      });
    }
  }

  return differences;
}
```

### 3. Backend Routes (server/routes.ts)
```typescript
import { Express } from "express";
import { storage } from "./storage";
import { insertOrgConnectionSchema, MetadataType } from "@shared/schema";
import jsforce from "jsforce";

export async function registerRoutes(app: Express) {
  // Connect to org
  app.post("/api/org/connect", async (req, res) => {
    try {
      const connection = insertOrgConnectionSchema.parse(req.body);
      const conn = new jsforce.Connection({
        loginUrl: connection.instanceUrl
      });

      try {
        await conn.login(connection.username, connection.password);
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
      const connections = await storage.getAllConnections();
      const sourceConnection = connections[0];

      if (!sourceConnection) {
        return res.status(404).json({ error: "Source org not connected" });
      }

      const conn = new jsforce.Connection({
        loginUrl: sourceConnection.instanceUrl
      });

      await conn.login(sourceConnection.username, sourceConnection.password);
      const metadata = await conn.metadata.list([{ type: validType }]);
      res.json(metadata);
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  // Get metadata for target org (similar to source)
  app.get("/api/metadata/target/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const validType = type as MetadataType;
      const connections = await storage.getAllConnections();
      const targetConnection = connections[1];

      if (!targetConnection) {
        return res.status(404).json({ error: "Target org not connected" });
      }

      const conn = new jsforce.Connection({
        loginUrl: targetConnection.instanceUrl
      });

      await conn.login(targetConnection.username, targetConnection.password);
      const metadata = await conn.metadata.list([{ type: validType }]);
      res.json(metadata);
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });
}
```

### 4. Frontend Components

#### Org Connection Component (client/src/components/org-connection.tsx)
```typescript
// Connection form with username/password and environment selection
export function OrgConnection({ title, onConnect }: OrgConnectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      username: "",
      password: "",
      orgType: "production"
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (data: ConnectionFormData) => {
      const loginUrl = data.orgType === "production" 
        ? "https://login.salesforce.com"
        : "https://test.salesforce.com";

      const res = await apiRequest("POST", "/api/org/connect", {
        ...data,
        instanceUrl: loginUrl
      });
      return res.json();
    },
    onSuccess: (data) => {
      setIsConnected(true);
      onConnect(data);
      toast({
        title: "Connected successfully",
        description: "Your Salesforce org has been connected",
      });
    }
  });

  // Form JSX implementation with environment selection radio buttons,
  // username/password inputs, and connect button
}
```

#### Metadata Comparison Component (client/src/components/metadata-comparison.tsx)
```typescript
export function MetadataComparison({ sourceData, targetData, type }: ComparisonProps) {
  const differences = [];

  // Compare metadata between source and target
  for (const key in sourceData) {
    if (sourceData[key] !== targetData[key]) {
      differences.push({
        field: key,
        sourceValue: sourceData[key],
        targetValue: targetData[key]
      });
    }
  }

  // Check for items in target that aren't in source
  for (const key in targetData) {
    if (!sourceData.hasOwnProperty(key)) {
      differences.push({
        field: key,
        sourceValue: 'Not present',
        targetValue: targetData[key]
      });
    }
  }

  // Render comparison table with differences
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type} Comparison
          <Badge variant="outline" className="ml-2">
            {differences.length} differences
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          {/* Table implementation showing field, source value, and target value */}
        </Table>
      </CardContent>
    </Card>
  );
}
```

#### Main Comparison Page (client/src/pages/compare.tsx)
```typescript
export default function Compare() {
  // Queries for different metadata types
  const { data: sourceProfiles, isLoading: sourceProfilesLoading } = useQuery({
    queryKey: ["/api/metadata/source/Profile"],
  });

  const { data: targetProfiles, isLoading: targetProfilesLoading } = useQuery({
    queryKey: ["/api/metadata/target/Profile"],
  });

  // Similar queries for CustomObject, CustomField, and ValidationRule

  // Render tabs for different metadata types with comparison components
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Metadata Comparison</h1>
      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="objects">Objects</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="validationRules">Validation Rules</TabsTrigger>
        </TabsList>

        {/* TabsContent for each metadata type */}
      </Tabs>
    </div>
  );
}
```

## How it Works

1. Users connect to two Salesforce orgs using username/password authentication
2. The system stores the connections and handles authentication
3. When viewing comparisons, the app fetches metadata from both orgs
4. Metadata is compared and differences are displayed in a table format
5. Users can switch between different metadata types using tabs

The application uses:
- jsforce for Salesforce API interactions
- React Query for data fetching
- Zod for schema validation
- Tailwind CSS with shadcn/ui for styling
