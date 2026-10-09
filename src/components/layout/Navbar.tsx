"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTRF } from "@/context/TRFContext";
import { useTheme } from "@/context/ThemeContext";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileCheck2,
  Gift,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  MessageSquare,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NavTab } from "./Sidebar";

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onOpenNewClaim: () => void;
  onOpenNewTreat: () => void;
  onOpenProfile: () => void;
  onToggleSidebar?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export function Navbar({
  onOpenNewTransaction,
  onOpenNewClaim,
  onOpenNewTreat,
  onOpenProfile,
  onToggleSidebar,
  onNavigateTab,
}: NavbarProps) {
  const router = useRouter();
  const { currentUser, isManager, currentBalance, unreadDirectMessagesCount, logout } = useTRF();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left Mobile Menu Toggle & Pool Balance */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Funds Pool:
            </span>
            <span className="text-sm font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
              {formatPKR(currentBalance)}
            </span>
          </div>
        </div>

        {/* Right Actions & Account */}
        <div className="flex items-center gap-2">
          {/* 1-on-1 Direct Messages */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (onNavigateTab) onNavigateTab("messages");
              router.push("/dashboard/chat");
            }}
            className="relative text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            title="Direct Messages"
            aria-label="Direct Messages"
          >
            <MessageSquare className="h-4 w-4" />
            {unreadDirectMessagesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-xs leading-none">
                {unreadDirectMessagesCount > 9 ? "9+" : unreadDirectMessagesCount}
              </span>
            )}
          </Button>

          {/* In-App Notifications Center */}
          <NotificationBell onNavigateTab={onNavigateTab} />

          {/* Light/Dark Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Declare Treat (All Members)
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNewTreat}
            className="hidden sm:inline-flex gap-1.5"
          >
            <Gift className="h-3.5 w-3.5" />
            <span>Treat</span>
          </Button> */}

          {/* Manager Action Buttons */}
          {isManager && (
            <>
              {/* <Button
                variant="outline"
                size="sm"
                onClick={onOpenNewClaim}
                className="hidden md:inline-flex gap-1.5"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Claim</span>
              </Button> */}
              <Button
                size="sm"
                onClick={onOpenNewTransaction}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Expense</span>
              </Button>
            </>
          )}

          {/* User Persona Switcher & Account Menu */}
          <div className="relative group ml-1">
            <button className="flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 p-1 pl-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {isManager ? "Manager" : "Member"}
                </div>
              </div>
              <img
                src={
                  currentUser.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                }
                alt={currentUser.name}
                className="h-6 w-6 rounded-full object-cover"
              />
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {/* Menu */}
            <div className="absolute right-0 mt-1 w-56 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1">
                <div>
                  <div className="text-xs font-semibold">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                    {currentUser.email}
                  </div>
                </div>
                <Badge
                  variant={isManager ? "default" : "secondary"}
                  className="text-[9px] px-1 py-0 h-4"
                >
                  {isManager ? "Admin" : "Member"}
                </Badge>
              </div>

              <button
                onClick={onOpenProfile}
                className="w-full text-left rounded px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Profile & Settings
              </button>

              <div className="pt-1 mt-1 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={logout}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
