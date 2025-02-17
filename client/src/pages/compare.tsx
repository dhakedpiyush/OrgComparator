import { useQuery } from "@tanstack/react-query";
import { MetadataComparison } from "@/components/metadata-comparison";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MetadataType } from "@shared/schema";

interface MetadataResponse {
  profiles?: Record<string, any>;
  objects?: Record<string, any>;
  fields?: Record<string, any>;
  validationRules?: Record<string, any>;
}

export default function Compare() {
  const { data: sourceMetadata, isLoading: sourceLoading } = useQuery<MetadataResponse>({
    queryKey: ["/api/metadata/source/all"]
  });

  const { data: targetMetadata, isLoading: targetLoading } = useQuery<MetadataResponse>({
    queryKey: ["/api/metadata/target/all"]
  });

  if (sourceLoading || targetLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

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