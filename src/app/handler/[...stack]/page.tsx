"use client";

import { useEffect } from "react";
import { DocuCraftLogo } from "@/components/docucraft-logo";

export default function Handler() {
  useEffect(() => {
    // Redirect to home for now during deployment
    window.location.href = "/";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <DocuCraftLogo />
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Redirecting...</h1>
          <p className="text-muted-foreground">Setting up authentication...</p>
        </div>
      </div>
    </div>
  );
}
