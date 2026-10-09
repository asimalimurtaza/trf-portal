"use client";

import React, { useState } from "react";
import { useTRF } from "@/context/TRFContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Cake,
  Compass,
  Gift,
  Users,
  Wallet,
  ChevronLeft,
  Sun,
  Moon,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type NavTab =
  | "overview"
  | "ledger"
  | "audit-claims"
  | "birthdays"
  | "activities-venues"
  | "rules-treats"
  | "members"
  | "messages";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenProfile?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onOpenProfile,
}: SidebarProps) {
  const { currentUser, isManager, unreadDirectMessagesCount } = useTRF();
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Expanded if manually uncollapsed (pinned) OR currently hovered by mouse
  const isExpanded = !isCollapsed || isHovered;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "ledger", label: "Funds Ledger", icon: Receipt },
    { id: "audit-claims", label: "Audit Claims", icon: FileSpreadsheet },
    { id: "birthdays", label: "Birthdays", icon: Cake },
    { id: "activities-venues", label: "Places & Outings", icon: Compass },
    { id: "rules-treats", label: "Treats & Rules", icon: Gift },
    { id: "members", label: "Team & Fees", icon: Users },
    { id: "messages", label: "Direct Messages", icon: MessageSquare, badge: unreadDirectMessagesCount },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 z-40 h-screen border-r flex flex-col justify-between hidden md:flex bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 transition-shadow ${
        isHovered && isCollapsed ? "shadow-2xl ring-1 ring-black/5 dark:ring-white/10" : ""
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center">
          {isExpanded ? (
            <div className="w-full flex items-center justify-between px-3.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-xs">
                  <Wallet className="h-4 w-4" />
                </div>
                <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                  Vicenna-AlmusNet TRF
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 shrink-0"
                title={isCollapsed ? "Lock / pin sidebar open" : "Collapse sidebar"}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-xs">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={!isExpanded ? item.label : undefined}
                className={`w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  !isExpanded ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500"
                    }`}
                  />
                  {!isExpanded && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-950" />
                  )}
                </div>
                {isExpanded && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold h-4 min-w-4 px-1 leading-none shadow-xs">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        {/* Theme button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={`w-full justify-start text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 ${
            !isExpanded ? "justify-center px-0" : ""
          }`}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Moon className="h-3.5 w-3.5 shrink-0" />
          )}
          {isExpanded && (
            <span className="ml-2 text-xs">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          )}
        </Button>

        {/* User profile */}
        <button
          onClick={onOpenProfile}
          className={`w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-left ${
            !isExpanded ? "justify-center p-1" : ""
          }`}
          title="Click to view & edit profile"
        >
          <img
            src={
              currentUser.avatarUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
            }
            alt={currentUser.name}
            className="h-6 w-6 rounded-full object-cover shrink-0"
          />
          {isExpanded && (
            <div className="min-w-0">
              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {isManager ? "Manager" : "Member"}
              </div>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
