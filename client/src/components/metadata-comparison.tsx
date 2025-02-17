
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComparisonProps {
  sourceData: any;
  targetData: any;
  type: string;
  showOnlyChanges?: boolean;
  filterStatus?: 'all' | 'added' | 'removed' | 'modified';
}

function formatValue(value: any): string {
  if (value === undefined || value === null) return 'Not present';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => 
        typeof item === 'object' ? item.fullName || JSON.stringify(item) : String(item)
      ).join(', ');
    }
    // Handle objects
    return value.fullName || value.label || JSON.stringify(value);
  }
  return String(value);
}

function getFriendlyFieldName(fieldName: string): string {
  // Convert camelCase to Title Case with spaces
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function sortByApiName(differences: any[]): any[] {
  return differences.sort((a, b) => a.field.localeCompare(b.field));
}

export function MetadataComparison({ sourceData, targetData, type, showOnlyChanges, filterStatus }: ComparisonProps) {
  const differences = [];
  const processedFields = new Set();

  // Compare the metadata
  for (const key in sourceData) {
    if (!processedFields.has(key)) {
      const sourceValue = sourceData[key];
      const targetValue = targetData[key];

      if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
        differences.push({
          field: key,
          sourceValue,
          targetValue: targetValue || 'Not present',
          status: targetValue ? 'modified' : 'removed'
        });
      }
      processedFields.add(key);
    }
  }

  // Check for items in target that aren't in source
  for (const key in targetData) {
    if (!processedFields.has(key)) {
      differences.push({
        field: key,
        sourceValue: 'Not present',
        targetValue: targetData[key],
        status: 'added'
      });
      processedFields.add(key);
    }
  }

  let filteredDifferences = differences;
  
  if (showOnlyChanges) {
    filteredDifferences = differences.filter(diff => 
      diff.sourceValue !== diff.targetValue
    );
  }

  if (filterStatus && filterStatus !== 'all') {
    filteredDifferences = filteredDifferences.filter(diff => 
      diff.status === filterStatus
    );
  }

  const sortedDifferences = sortByApiName(filteredDifferences);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{type} Comparison</span>
          <Badge variant={differences.length > 0 ? "destructive" : "secondary"}>
            {differences.length} differences
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Field Name</TableHead>
                <TableHead>Source Org</TableHead>
                <TableHead>Target Org</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDifferences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No differences found
                  </TableCell>
                </TableRow>
              ) : (
                sortedDifferences.map((diff, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {getFriendlyFieldName(diff.field)}
                    </TableCell>
                    <TableCell className={diff.status === 'removed' ? 'text-red-500' : ''}>
                      {formatValue(diff.sourceValue)}
                    </TableCell>
                    <TableCell className={diff.status === 'added' ? 'text-green-500' : ''}>
                      {formatValue(diff.targetValue)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          diff.status === 'added' ? 'success' :
                          diff.status === 'removed' ? 'destructive' :
                          'warning'
                        }
                      >
                        {diff.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
