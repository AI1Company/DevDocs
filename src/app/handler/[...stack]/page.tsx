"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Handler() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home for now during deployment
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Redirecting...</h1>
          <p className="text-gray-600">Setting up authentication...</p>
        </div>
      </div>
    </div>
  );
}
