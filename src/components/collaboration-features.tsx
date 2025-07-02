
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, Clock, MessageSquare } from 'lucide-react';

const fakeUsers = [
  { name: 'Alice', color: 'bg-chart-1 text-white' },
  { name: 'Bob', color: 'bg-chart-2 text-white' },
  { name: 'Charlie', color: 'bg-chart-3 text-white' },
];

export function CollaborationFeatures() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    setOpen(false);
    toast({
      title: 'Invitation Sent!',
      description: 'Your collaborator has been invited. (This is a demo feature)',
    });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {fakeUsers.map(user => (
            <Tooltip key={user.name}>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-background">
                  <AvatarFallback className={user.color}>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name} (Online)</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus />
              Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Collaborator</DialogTitle>
              <DialogDescription>
                Enter the email of the person you want to invite. (This is a demo and will not send an email).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                        Email
                    </Label>
                    <Input id="email" type="email" placeholder="name@example.com" className="col-span-3" required />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">
                        <Send />
                        Send Invitation
                    </Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9" disabled>
              <MessageSquare />
              <span className="sr-only">Comments</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Commenting (Coming Soon)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9" disabled>
              <Clock />
              <span className="sr-only">Version History</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Version History (Coming Soon)</p>
          </TooltipContent>
        </Tooltip>

      </div>
    </TooltipProvider>
  );
}
