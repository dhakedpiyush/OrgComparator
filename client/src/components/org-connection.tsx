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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const connectionSchema = z.object({
  instanceUrl: z.string().url("Please enter a valid Salesforce URL"),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
  orgType: z.enum(["production", "sandbox"]),
});

type ConnectionFormData = z.infer<typeof connectionSchema>;

interface OrgConnectionProps {
  title: string;
  onConnect: (connection: any) => void;
}

export function OrgConnection({ title, onConnect }: OrgConnectionProps) {
  const [showToken, setShowToken] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      instanceUrl: "",
      accessToken: "",
      refreshToken: "",
      orgType: "production"
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (data: ConnectionFormData) => {
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
        description: "Failed to connect to Salesforce org. Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    connectMutation.mutate(data);
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
                <p>Enter your Salesforce instance URL and authentication tokens</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Instance URL (e.g., https://yourorg.my.salesforce.com)"
              {...form.register("instanceUrl")}
              className="mb-2"
            />
            {form.formState.errors.instanceUrl && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.instanceUrl.message}
              </p>
            )}
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                placeholder="Access Token"
                {...form.register("accessToken")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.accessToken && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.accessToken.message}
              </p>
            )}
            <Input
              type={showToken ? "text" : "password"}
              placeholder="Refresh Token"
              {...form.register("refreshToken")}
              className="mt-2"
            />
            {form.formState.errors.refreshToken && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.refreshToken.message}
              </p>
            )}
          </div>
          <Button 
            type="submit"
            className="w-full"
            disabled={connectMutation.isPending}
          >
            {connectMutation.isPending ? "Connecting..." : "Connect"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}