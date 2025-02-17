
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
    if (Array.isArray(value)) {
      return value.map(item => 
        typeof item === 'object' ? item.fullName || JSON.stringify(item) : String(item)
      ).join(', ');
    }
    return value.fullName || value.label || JSON.stringify(value);
  }
  return String(value);
}

function getFieldDetails(field: string, value: any): { label: string; name: string } {
  if (typeof value === 'object' && value !== null) {
    return {
      label: value.label || value.Label || getFriendlyFieldName(field),
      name: field
    };
  }
  return {
    label: getFriendlyFieldName(field),
    name: field
  };
}

function getFriendlyFieldName(fieldName: string): string {
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
          <div className="relative">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[200px] resize-x">Source Org</TableHead>
                  <TableHead className="min-w-[200px] resize-x">Target Org</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDifferences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No differences found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedDifferences.map((diff, i) => {
                    const fieldDetails = getFieldDetails(diff.field, diff.sourceValue || diff.targetValue);
                    return (
                      <TableRow key={i}>
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
                        <TableCell className={diff.status === 'removed' ? 'text-red-500' : ''}>
                          {formatValue(diff.sourceValue)}
                        </TableCell>
                        <TableCell className={diff.status === 'added' ? 'text-green-500' : ''}>
                          {formatValue(diff.targetValue)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
