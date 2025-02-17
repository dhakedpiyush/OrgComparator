import { useQuery } from "@tanstack/react-query";
import { MetadataComparison } from "@/components/metadata-comparison";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MetadataResponse {
  profiles?: Record<string, any>;
  objects?: Record<string, any>;
  fields?: Record<string, any>;
  validationRules?: Record<string, any>;
}

export default function Compare() {
  const { data: sourceMetadata, isLoading: sourceLoading, error: sourceError } = useQuery<MetadataResponse>({
    queryKey: ["/api/metadata/source/all"],
    retry: 1
  });

  const { data: targetMetadata, isLoading: targetLoading, error: targetError } = useQuery<MetadataResponse>({
    queryKey: ["/api/metadata/target/all"],
    retry: 1
  });

  if (sourceLoading || targetLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Loading Metadata...</h1>
        <Skeleton className="w-full h-[400px]" />
      </div>
    );
  }

  if (sourceError || targetError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch metadata. Please ensure both orgs are connected and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Metadata Comparison</h1>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="objects">Objects</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="validationRules">Validation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <MetadataComparison
            sourceData={sourceMetadata?.profiles || {}}
            targetData={targetMetadata?.profiles || {}}
            type="Profiles"
          />
        </TabsContent>

        <TabsContent value="objects">
          <MetadataComparison
            sourceData={sourceMetadata?.objects || {}}
            targetData={targetMetadata?.objects || {}}
            type="Objects"
          />
        </TabsContent>

        <TabsContent value="fields">
          <MetadataComparison
            sourceData={sourceMetadata?.fields || {}}
            targetData={targetMetadata?.fields || {}}
            type="Fields"
          />
        </TabsContent>

        <TabsContent value="validationRules">
          <MetadataComparison
            sourceData={sourceMetadata?.validationRules || {}}
            targetData={targetMetadata?.validationRules || {}}
            type="Validation Rules"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}