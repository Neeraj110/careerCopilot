import { useRouter } from "next/navigation";
import { 
  LayoutGrid, 
  FileText, 
  MessageSquare, 
  FolderOpen, 
  Map, 
  BarChart3, 
  Layers, 
  History 
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command";
import { useCallback } from "react";

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const runCommand = useCallback(
    (command: () => void) => {
      onClose();
      command();
    },
    [onClose]
  );

  return (
    <CommandDialog open={open} onOpenChange={onClose} title="Search" description="Search the application">
      <Command>
        <CommandInput placeholder="Search resumes, keywords, rewrites..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/resumes"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Resumes</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/chat"))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Chat</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/documents"))}>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Documents</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/roadmaps"))}>
              <Map className="mr-2 h-4 w-4" />
              <span>Roadmaps</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/insights"))}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Insights</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/versions"))}>
              <Layers className="mr-2 h-4 w-4" />
              <span>Versions</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/history"))}>
              <History className="mr-2 h-4 w-4" />
              <span>History</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
