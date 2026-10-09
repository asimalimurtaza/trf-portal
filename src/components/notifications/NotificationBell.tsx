'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { InAppNotification, NotificationType } from '@/types/trf';
import { NavTab } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCheck,
  Trash2,
  Cake,
  DollarSign,
  Compass,
  FileCheck2,
  Sparkles,
  ExternalLink,
  Inbox,
  X,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBellProps {
  onNavigateTab?: (tab: NavTab) => void;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'birthday':
      return <Cake className="h-4 w-4 text-pink-500" />;
    case 'due':
      return <DollarSign className="h-4 w-4 text-amber-500" />;
    case 'outing':
      return <Compass className="h-4 w-4 text-sky-500" />;
    case 'claim':
      return <FileCheck2 className="h-4 w-4 text-emerald-500" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-indigo-500" />;
    case 'system':
    default:
      return <Sparkles className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function NotificationBell({ onNavigateTab }: NotificationBellProps) {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useTRF();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleNotificationClick = (n: InAppNotification) => {
    if (!n.isRead) {
      markNotificationAsRead(n.id);
    }
    if (n.targetTab && onNavigateTab) {
      onNavigateTab(n.targetTab);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs leading-none">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </Button>

      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-popover shadow-2xl z-50 overflow-hidden text-popover-foreground flex flex-col"
            style={{ maxHeight: 'calc(100vh - 80px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">
                    {unreadNotificationsCount} new
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadNotificationsCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllNotificationsAsRead}
                    className="h-6 px-1.5 text-[11px] text-zinc-500 hover:text-foreground gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Mark all read</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 text-zinc-400 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/10 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Unread ({unreadNotificationsCount})
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 max-h-[360px]">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="inline-flex p-3 rounded-full bg-muted/40 text-muted-foreground mb-2">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {filter === 'unread'
                      ? 'You are all caught up with recent updates.'
                      : 'Activity updates and alerts will appear here.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 transition-colors cursor-pointer group flex items-start gap-3 hover:bg-muted/50 ${
                      !n.isRead ? 'bg-primary/[0.04]' : ''
                    }`}
                  >
                    {/* Type Icon */}
                    <div className="p-2 rounded-lg bg-muted/60 shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          {!n.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                          )}
                          <span className={`text-xs ${!n.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
                            {n.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {formatRelativeTime(n.timestamp)}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Quick Navigation Action */}
                      {n.actionLabel && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-primary">
                          <span>{n.actionLabel}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-opacity p-1 cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
                <span className="text-[10px] text-muted-foreground">
                  {unreadNotificationsCount} unread of {notifications.length} total
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="h-6 text-[10px] text-muted-foreground hover:text-red-600"
                >
                  Clear all
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
