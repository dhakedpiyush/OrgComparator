import { OrgConnection } from "@/components/org-connection";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [sourceOrg, setSourceOrg] = useState<any>(null);
  const [targetOrg, setTargetOrg] = useState<any>(null);

  const handleCompare = () => {
    if (sourceOrg && targetOrg) {
      setLocation("/compare");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        Salesforce Org Metadata Comparison
      </h1>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <OrgConnection 
          title="Source Org" 
          onConnect={setSourceOrg}
        />
        <OrgConnection 
          title="Target Org" 
          onConnect={setTargetOrg}
        />
      </div>

      <Button
        className="w-full"
        disabled={!sourceOrg || !targetOrg}
        onClick={handleCompare}
      >
        Compare Metadata
      </Button>
    </div>
  );
}