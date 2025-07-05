"use client";

import { SignIn, SignUp } from "@stackframe/stack";
import { DocuCraftLogo } from "./docucraft-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthPageProps {
  mode?: "sign-in" | "sign-up";
}

export function AuthPage({ mode = "sign-in" }: AuthPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <DocuCraftLogo />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to DocuCraft AI
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Create AI-powered documentation for your projects
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in with Google, GitHub, or email to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={mode} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-in" className="mt-4">
                <SignIn />
              </TabsContent>
              <TabsContent value="sign-up" className="mt-4">
                <SignUp />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
