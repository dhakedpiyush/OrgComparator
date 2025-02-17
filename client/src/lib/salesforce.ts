import jsforce from "jsforce";

export async function createConnection(instanceUrl: string, accessToken: string) {
  return new jsforce.Connection({
    instanceUrl,
    accessToken
  });
}

export async function fetchMetadata(conn: jsforce.Connection, type: string) {
  const metadata = await conn.metadata.read(type);
  return metadata;
}

export async function compareMetadata(source: any, target: any) {
  const differences = [];
  
  for (const key in source) {
    if (source[key] !== target[key]) {
      differences.push({
        field: key,
        sourceValue: source[key],
        targetValue: target[key]
      });
    }
  }
  
  return differences;
}
