"use client";

import * as React from 'react';
import Link from 'next/link';
import { Project, ProjectStatus } from '@/lib/projects';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Rocket, CheckCircle2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onRename, onDelete }: ProjectCardProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isRenameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [newName, setNewName] = React.useState(project.metadata.name);

  const handleRename = () => {
    onRename(project.id, newName);
    setRenameDialogOpen(false);
  };
  
  const statusConfig: Record<ProjectStatus, { icon: React.ElementType, badgeVariant: "default" | "secondary" | "destructive" | "outline" | null | undefined }> = {
    'In Progress': { icon: Rocket, badgeVariant: 'secondary' },
    'Completed': { icon: CheckCircle2, badgeVariant: 'default' },
  };

  const StatusIcon = statusConfig[project.status].icon;

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex-1 overflow-hidden pr-2'>
                <CardTitle className="text-xl truncate" title={project.metadata.name}>{project.metadata.name}</CardTitle>
                <CardDescription>Last modified: {format(new Date(project.lastModified), 'PPP')}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <Badge variant={statusConfig[project.status].badgeVariant}>
                <StatusIcon className={`mr-1 h-3 w-3`} />
                {project.status}
            </Badge>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href={`/project/${project.id}`}>Open Project</Link>
            </Button>
        </CardFooter>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rename Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleRename}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project "{project.metadata.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(project.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
