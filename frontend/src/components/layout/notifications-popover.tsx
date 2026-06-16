"use client";

import { Bell } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/providers/ui-provider";

export function NotificationsPopover() {
  const { toast } = useToast();

  return (
    <IconButton
      dot
      onClick={() => toast.info("No new notifications", "You're all caught up!")}
      title="Notifications"
    >
      <Bell size={16} />
    </IconButton>
  );
}
