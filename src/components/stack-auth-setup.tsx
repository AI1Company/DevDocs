"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocuCraftLogo } from "./docucraft-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

export function StackAuthSetup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <DocuCraftLogo />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Almost Ready!</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Complete Stack Auth setup to enable authentication
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Stack Auth Configuration Required
              <ExternalLink className="h-4 w-4" />
            </CardTitle>
            <CardDescription>
              Your authentication system is set up but needs Stack Auth
              credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Stack Auth environment variables are not configured. Please
                follow the setup instructions in STACK_AUTH_SETUP.md
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-medium">Quick Setup Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Go to{" "}
                  <a
                    href="https://stack-auth.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary"
                  >
                    stack-auth.com
                  </a>{" "}
                  and create a project
                </li>
                <li>Configure Google and GitHub OAuth providers</li>
                <li>Copy your credentials to .env.local</li>
                <li>Restart the development server</li>
              </ol>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ Google & GitHub OAuth login</li>
                <li>✅ Secure user authentication</li>
                <li>✅ User-specific projects</li>
                <li>✅ Cross-device synchronization</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
