import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface OrgConnectionProps {
  title: string;
  onConnect: (connection: any) => void;
}

export function OrgConnection({ title, onConnect }: OrgConnectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const connectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/org/connect", data);
      return res.json();
    },
    onSuccess: (data) => {
      setIsConnected(true);
      onConnect(data);
      toast({
        title: "Connected successfully",
        description: "Your Salesforce org has been connected",
      });
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Salesforce org",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className={`transition-colors ${isConnected ? "bg-green-50" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter your Salesforce credentials</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input 
              placeholder="Instance URL" 
              className="mb-2"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button 
            className="w-full"
            onClick={() => connectMutation.mutate({ /* connection data */ })}
            disabled={connectMutation.isPending}
          >
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}