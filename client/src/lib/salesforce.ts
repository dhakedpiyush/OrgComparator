import jsforce from "jsforce";
import { MetadataType } from "@shared/schema";

export interface MetadataResponse {
  profiles?: Record<string, any>;
  objects?: Record<string, any>;
  fields?: Record<string, any>;
  validationRules?: Record<string, any>;
  customSettings?: Record<string, any>;
  customMetadata?: Record<string, any>;
}

export async function createConnection(instanceUrl: string, accessToken: string) {
  try {
    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken
    });

    // Verify connection by attempting to get user info
    await conn.identity();
    return conn;
  } catch (error) {
    console.error('Connection error:', error);
    throw new Error('Failed to connect to Salesforce');
  }
}

export async function fetchMetadata(conn: jsforce.Connection, type: MetadataType): Promise<Record<string, any>> {
  try {
    const metadata = await conn.metadata.read(type);
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

    // Compare properties
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

function compareProperties(source: any, target: any, path: string[] = []): any[] {
  const differences = [];

  if (typeof source !== typeof target) {
    return [{
      path: path.join('.'),
      sourceValue: source,
      targetValue: target
    }];
  }

  if (typeof source !== 'object' || source === null) {
    if (source !== target) {
      return [{
        path: path.join('.'),
        sourceValue: source,
        targetValue: target
      }];
    }
    return [];
  }

  for (const key in source) {
    if (!(key in target)) {
      differences.push({
        path: [...path, key].join('.'),
        status: 'missing_in_target',
        sourceValue: source[key]
      });
      continue;
    }

    const nestedDiffs = compareProperties(source[key], target[key], [...path, key]);
    differences.push(...nestedDiffs);
  }

  for (const key in target) {
    if (!(key in source)) {
      differences.push({
        path: [...path, key].join('.'),
        status: 'missing_in_source',
        targetValue: target[key]
      });
    }
  }

  return differences;
}