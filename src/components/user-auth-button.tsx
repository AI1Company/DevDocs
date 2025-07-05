"use client";

import { useUser, UserButton, SignIn } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function UserAuthButton() {
  const user = useUser();

  if (user) {
    return <UserButton />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Sign In</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <SignIn />
      </DialogContent>
    </Dialog>
  );
}
