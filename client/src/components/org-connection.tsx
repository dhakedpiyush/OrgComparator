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
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  orgType: z.enum(["production", "sandbox"]),
});

type ConnectionFormData = z.infer<typeof connectionSchema>;

interface OrgConnectionProps {
  title: string;
  onConnect: (connection: any) => void;
}

export function OrgConnection({ title, onConnect }: OrgConnectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      instanceUrl: "",
      username: "",
      password: "",
      orgType: "production"
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (data: ConnectionFormData) => {
      // Adjust the instance URL based on org type
      const loginUrl = data.orgType === "production" 
        ? "https://login.salesforce.com"
        : "https://test.salesforce.com";

      const res = await apiRequest("POST", "/api/org/connect", {
        ...data,
        instanceUrl: loginUrl
      });
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
    onError: (error) => {
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
                <p>Enter your Salesforce credentials to connect to your org</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Username"
              {...form.register("username")}
              className="mb-2"
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.username.message}
              </p>
            )}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...form.register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.password.message}
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