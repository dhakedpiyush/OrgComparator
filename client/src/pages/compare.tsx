
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MetadataComparison } from "@/components/metadata-comparison";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetadataType } from "@shared/schema";

export default function Compare() {
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const handleShowOnlyChangesChange = (checked: boolean) => {
    setShowOnlyChanges(checked);
    if (!checked) {
      setFilterStatus('all');
    }
  };
  const [filterStatus, setFilterStatus] = useState<'all' | 'added' | 'removed' | 'modified'>('all');

  // Query for connections
  const { data: connections } = useQuery({
    queryKey: ["/api/org/connections"],
  });

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
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Metadata Comparison</h1>
        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
          <div className="border-4 border-primary border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-lg text-gray-600">Loading metadata comparison...</p>
        </div>
      </div>
    );
  }

  const sourceConnection = connections?.[0];
  const targetConnection = connections?.[1];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Metadata Comparison</h1>
      <div className="flex justify-between mb-8 text-sm text-gray-600">
        <div>Source Org: {sourceConnection?.username || 'Not connected'}</div>
        <div>Target Org: {targetConnection?.username || 'Not connected'}</div>
      </div>
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Switch 
            id="show-changes" 
            checked={showOnlyChanges}
            onCheckedChange={handleShowOnlyChangesChange}
          />
          <Label htmlFor="show-changes">Only Show Changes</Label>
          {showOnlyChanges && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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
          )}
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
              showOnlyChanges={showOnlyChanges}
              filterStatus={filterStatus}
            />
          </TabsContent>

          <TabsContent value="objects">
            <MetadataComparison
              sourceData={sourceObjects || {}}
              targetData={targetObjects || {}}
              type="Objects"
              showOnlyChanges={showOnlyChanges}
              filterStatus={filterStatus}
            />
          </TabsContent>

          <TabsContent value="fields">
            <MetadataComparison
              sourceData={sourceFields || {}}
              targetData={targetFields || {}}
              type="Fields"
              showOnlyChanges={showOnlyChanges}
              filterStatus={filterStatus}
            />
          </TabsContent>

          <TabsContent value="validationRules">
            <MetadataComparison
              sourceData={sourceRules || {}}
              targetData={targetRules || {}}
              type="Validation Rules"
              showOnlyChanges={showOnlyChanges}
              filterStatus={filterStatus}
            />
          </TabsContent>

          <TabsContent value="apexClasses">
            <MetadataComparison
              sourceData={sourceApexClasses || {}}
              targetData={targetApexClasses || {}}
              type="Apex Classes"
              showOnlyChanges={showOnlyChanges}
              filterStatus={filterStatus}
            />
          </TabsContent>

          <TabsContent value="apexTriggers">
            <MetadataComparison
              sourceData={sourceApexTriggers || {}}
              targetData={targetApexTriggers || {}}
              type="Apex Triggers"
              showOnlyChanges={showOnlyChanges}
              filterStatus={filterStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
