import { useQuery } from "@tanstack/react-query";
import { MetadataComparison } from "@/components/metadata-comparison";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MetadataType } from "@shared/schema";

export default function Compare() {
  // Query for Profiles
  const { data: sourceProfiles, isLoading: sourceProfilesLoading } = useQuery({
    queryKey: ["/api/metadata/source/Profile"],
  });

  const { data: targetProfiles, isLoading: targetProfilesLoading } = useQuery({
    queryKey: ["/api/metadata/target/Profile"],
  });

  // Query for Custom Objects
  const { data: sourceObjects, isLoading: sourceObjectsLoading } = useQuery({
    queryKey: ["/api/metadata/source/CustomObject"],
  });

  const { data: targetObjects, isLoading: targetObjectsLoading } = useQuery({
    queryKey: ["/api/metadata/target/CustomObject"],
  });

  // Query for Custom Fields
  const { data: sourceFields, isLoading: sourceFieldsLoading } = useQuery({
    queryKey: ["/api/metadata/source/CustomField"],
  });

  const { data: targetFields, isLoading: targetFieldsLoading } = useQuery({
    queryKey: ["/api/metadata/target/CustomField"],
  });

  // Query for Validation Rules
  const { data: sourceRules, isLoading: sourceRulesLoading } = useQuery({
    queryKey: ["/api/metadata/source/ValidationRule"],
  });

  const { data: targetRules, isLoading: targetRulesLoading } = useQuery({
    queryKey: ["/api/metadata/target/ValidationRule"],
  });

  const { data: sourceApexClasses, isLoading: sourceApexClassesLoading } = useQuery({
    queryKey: ["/api/metadata/source/ApexClass"],
  });

  const { data: targetApexClasses, isLoading: targetApexClassesLoading } = useQuery({
    queryKey: ["/api/metadata/target/ApexClass"],
  });

  const { data: sourceApexTriggers, isLoading: sourceApexTriggersLoading } = useQuery({
    queryKey: ["/api/metadata/source/ApexTrigger"],
  });

  const { data: targetApexTriggers, isLoading: targetApexTriggersLoading } = useQuery({
    queryKey: ["/api/metadata/target/ApexTrigger"],
  });

  const isLoading = 
    sourceProfilesLoading || targetProfilesLoading ||
    sourceObjectsLoading || targetObjectsLoading ||
    sourceFieldsLoading || targetFieldsLoading ||
    sourceRulesLoading || targetRulesLoading ||
    sourceApexClassesLoading || targetApexClassesLoading ||
    sourceApexTriggersLoading || targetApexTriggersLoading;

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Metadata Comparison</h1>

      <div className="flex items-center gap-4 mb-4">
        <Switch id="show-changes" />
        <Label htmlFor="show-changes">Only Show Changes</Label>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Changes</SelectItem>
            <SelectItem value="added">Added Only</SelectItem>
            <SelectItem value="removed">Removed Only</SelectItem>
            <SelectItem value="modified">Modified Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="objects">Objects</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="validationRules">Validation Rules</TabsTrigger>
          <TabsTrigger value="apexClasses">Apex Classes</TabsTrigger>
          <TabsTrigger value="apexTriggers">Apex Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <MetadataComparison
            sourceData={sourceProfiles || {}}
            targetData={targetProfiles || {}}
            type="Profiles"
          />
        </TabsContent>

        <TabsContent value="objects">
          <MetadataComparison
            sourceData={sourceObjects || {}}
            targetData={targetObjects || {}}
            type="Objects"
          />
        </TabsContent>

        <TabsContent value="fields">
          <MetadataComparison
            sourceData={sourceFields || {}}
            targetData={targetFields || {}}
            type="Fields"
          />
        </TabsContent>

        <TabsContent value="validationRules">
          <MetadataComparison
            sourceData={sourceRules || {}}
            targetData={targetRules || {}}
            type="Validation Rules"
          />
        </TabsContent>

        <TabsContent value="apexClasses">
          <MetadataComparison
            sourceData={sourceApexClasses || {}}
            targetData={targetApexClasses || {}}
            type="Apex Classes"
          />
        </TabsContent>

        <TabsContent value="apexTriggers">
          <MetadataComparison
            sourceData={sourceApexTriggers || {}}
            targetData={targetApexTriggers || {}}
            type="Apex Triggers"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}