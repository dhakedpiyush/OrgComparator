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
            {differences.map((diff, i) => (
              <TableRow key={i}>
                <TableCell>{diff.field}</TableCell>
                <TableCell>{diff.sourceValue}</TableCell>
                <TableCell>{diff.targetValue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
