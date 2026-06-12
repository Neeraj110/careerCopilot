"use client";

import { Bell, Search, User, LogOut, Sun, Moon, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sidebarItems } from "./sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/40 bg-card/30 px-4 md:px-6 backdrop-blur-xl shadow-sm">
      <div className="flex md:hidden items-center">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 flex flex-col">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-16 items-center px-6 border-b border-border/50">
              <span className="text-lg font-heading font-bold text-foreground">CareerPilot</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 items-center gap-4">
        {/* Search Bar Placeholder */}
        <div className="hidden sm:block relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search documents, chats, skills..."
            className="h-9 w-full rounded-md border border-border bg-muted/50 pl-9 pr-4 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-danger"></span>
        </Button>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`} alt={user?.email || "User avatar"} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user?.email ? user.email.split('@')[0] : 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger focus:bg-danger-muted focus:text-danger cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
