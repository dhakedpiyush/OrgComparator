import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ComparisonProps {
  sourceData: any;
  targetData: any;
  type: string;
}

export function MetadataComparison({ sourceData, targetData, type }: ComparisonProps) {
  const differences = [];

  // Compare the metadata
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
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Source Org</TableHead>
              <TableHead>Target Org</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {differences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No differences found
                </TableCell>
              </TableRow>
            ) : (
              differences.map((diff, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{diff.field}</TableCell>
                  <TableCell>
                    {typeof diff.sourceValue === 'object' 
                      ? JSON.stringify(diff.sourceValue, null, 2)
                      : String(diff.sourceValue)
                    }
                  </TableCell>
                  <TableCell>
                    {typeof diff.targetValue === 'object'
                      ? JSON.stringify(diff.targetValue, null, 2)
                      : String(diff.targetValue)
                    }
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}