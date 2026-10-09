"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTRF } from "@/context/TRFContext";
import { DirectMessage } from "@/types/trf";
import {
  Search,
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function formatChatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatChatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
}

const QUICK_PROMPTS = [
  "👍 Sounds good!",
  "🎉 Congratulations!",
  "☕ Coffee break at the cafe?",
  "🍕 When is the next team treat?",
  "💸 Just settled my dues in TRF funds.",
];

export function DirectMessagesView() {
  const {
    currentUser,
    members,
    directMessages,
    activeChatUserId,
    setActiveChatUserId,
    sendDirectMessage,
    markDirectMessagesAsRead,
    isSupabaseLive,
  } = useTRF();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Other active team members (excluding currentUser)
  const teammates = useMemo(() => {
    return members.filter((m) => m.id !== currentUser.id && m.isActive);
  }, [members, currentUser.id]);

  // If no chat selected, default to activeChatUserId or the first teammate with a recent message
  const activePartner = useMemo(() => {
    if (activeChatUserId) {
      return teammates.find((m) => m.id === activeChatUserId) || null;
    }
    // Find teammate with most recent message
    const relevantMsgs = directMessages.filter(
      (m) => m.senderId === currentUser.id || m.receiverId === currentUser.id,
    );
    if (relevantMsgs.length > 0) {
      const lastMsg = relevantMsgs[relevantMsgs.length - 1];
      const partnerId =
        lastMsg.senderId === currentUser.id
          ? lastMsg.receiverId
          : lastMsg.senderId;
      return teammates.find((m) => m.id === partnerId) || teammates[0] || null;
    }
    return teammates[0] || null;
  }, [activeChatUserId, teammates, directMessages, currentUser.id]);

  // When activeChatUserId is set explicitly, switch to chat view on mobile
  useEffect(() => {
    if (activeChatUserId) {
      setMobileView("chat");
    }
  }, [activeChatUserId]);

  const handleSelectTeammate = (memberId: string) => {
    setActiveChatUserId(memberId);
    setMobileView("chat");
  };

  // Mark messages as read when active partner is opened
  useEffect(() => {
    if (activePartner) {
      markDirectMessagesAsRead(activePartner.id);
    }
  }, [activePartner?.id, directMessages.length]);

  // Conversation history for active partner
  const conversationMessages = useMemo(() => {
    if (!activePartner) return [];
    return directMessages
      .filter(
        (m) =>
          (m.senderId === currentUser.id &&
            m.receiverId === activePartner.id) ||
          (m.senderId === activePartner.id && m.receiverId === currentUser.id),
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [directMessages, currentUser.id, activePartner?.id]);

  // Scroll to bottom on conversation change or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activePartner?.id, conversationMessages.length]);

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; items: DirectMessage[] }[] = [];
    conversationMessages.forEach((msg) => {
      const dateLabel = formatChatDate(msg.createdAt);
      const existing = groups.find((g) => g.dateLabel === dateLabel);
      if (existing) {
        existing.items.push(msg);
      } else {
        groups.push({ dateLabel, items: [msg] });
      }
    });
    return groups;
  }, [conversationMessages]);

  // Teammates with conversation metadata (last message, unread count)
  const teammatesWithMeta = useMemo(() => {
    return teammates
      .map((t) => {
        const msgs = directMessages.filter(
          (m) =>
            (m.senderId === currentUser.id && m.receiverId === t.id) ||
            (m.senderId === t.id && m.receiverId === currentUser.id),
        );
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        const unreadCount = msgs.filter(
          (m) => m.senderId === t.id && !m.isRead,
        ).length;

        return {
          member: t,
          lastMsg,
          unreadCount,
          lastActivityTime: lastMsg ? new Date(lastMsg.createdAt).getTime() : 0,
        };
      })
      .filter((item) => {
        if (filterTab === "unread" && item.unreadCount === 0) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.member.name.toLowerCase().includes(q) ||
          item.member.email.toLowerCase().includes(q) ||
          (item.member.employeeId &&
            item.member.employeeId.toLowerCase().includes(q)) ||
          item.member.designation.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Unread first, then by last activity
        if (b.unreadCount !== a.unreadCount)
          return b.unreadCount - a.unreadCount;
        return b.lastActivityTime - a.lastActivityTime;
      });
  }, [teammates, directMessages, currentUser.id, filterTab, searchQuery]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activePartner || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      await sendDirectMessage(activePartner.id, textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const totalUnreadAll = useMemo(() => {
    return directMessages.filter(
      (m) => m.receiverId === currentUser.id && !m.isRead,
    ).length;
  }, [directMessages, currentUser.id]);

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* View Header */}
      <div className="shrink-0 flex items-center justify-between pb-2 sm:pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>Direct Messages</span>
            {isSupabaseLive && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1 bg-emerald-50/50 dark:bg-emerald-950/20"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </Badge>
            )}
          </h2>
        </div>
      </div>

      {/* Main Messaging Layout */}
      <Card className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm rounded-xl">
        {/* LEFT COLUMN: Teammates & Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/30 ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search & Filter Header */}
          <div className="shrink-0 p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teammates..."
                className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900"
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-colors text-center cursor-pointer ${
                  filterTab === "all"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                }`}
              >
                All ({teammates.length})
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium transition-colors text-center cursor-pointer ${
                  filterTab === "unread"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                }`}
              >
                Unread ({totalUnreadAll})
              </button>
            </div>
          </div>

          {/* Teammates List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {teammatesWithMeta.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                  No teammates found
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Try clearing your search query.
                </p>
              </div>
            ) : (
              teammatesWithMeta.map(({ member, lastMsg, unreadCount }) => {
                const isSelected = activePartner?.id === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelectTeammate(member.id)}
                    className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer relative ${
                      isSelected
                        ? "bg-zinc-200/60 dark:bg-zinc-800/80"
                        : "hover:bg-zinc-100/60 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    {/* Active indicator bar */}
                    {isSelected && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-zinc-100 rounded-r" />
                    )}

                    {/* Avatar with status */}
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback className="text-xs font-semibold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {member.name}
                          </span>
                          {member.role === "manager" && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-3.5 border-zinc-300 dark:border-zinc-700"
                            >
                              Admin
                            </Badge>
                          )}
                        </div>
                        {lastMsg && (
                          <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                            {formatChatTime(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {lastMsg ? (
                            <span>
                              {lastMsg.senderId === currentUser.id && (
                                <span className="text-zinc-400 mr-1">You:</span>
                              )}
                              {lastMsg.content}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">
                              No messages yet
                            </span>
                          )}
                        </p>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold h-4 min-w-4 px-1 shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Conversation Window */}
        <div
          className={`flex-1 flex flex-col min-h-0 h-full bg-white dark:bg-zinc-950 ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {activePartner ? (
            <>
              {/* Active Chat Header */}
              <div className="shrink-0 p-3 sm:px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/40 dark:bg-zinc-900/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileView("list")}
                    className="md:hidden -ml-1 mr-1 h-8 px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Chats</span>
                  </Button>

                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-zinc-200 dark:border-zinc-800">
                      <AvatarImage
                        src={activePartner.avatarUrl}
                        alt={activePartner.name}
                      />
                      <AvatarFallback className="text-xs font-semibold">
                        {activePartner.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                        {activePartner.name}
                      </h3>
                      {activePartner.employeeId && (
                        <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                          {activePartner.employeeId}
                        </span>
                      )}
                      <Badge
                        variant={
                          activePartner.role === "manager"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[9px] px-1 py-0 h-4 shrink-0"
                      >
                        {activePartner.role === "manager" ? "Admin" : "Member"}
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                      {activePartner.designation} • {activePartner.department}
                    </p>
                  </div>
                </div>

                {/* Actions / Status */}
                <div className="flex items-center gap-1.5 text-xs shrink-0 pl-2">
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="hidden sm:inline">Active</span>
                  </span>
                </div>
              </div>

              {/* Messages Stream Container (Dynamically fills all vertical space) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4">
                {conversationMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 text-center space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Start your conversation with {activePartner.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs mx-auto">
                        Send a message to coordinate team outings, discuss treat
                        events, or check TRF pool contributions.
                      </p>
                    </div>

                    {/* Quick starter chips */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-md mx-auto">
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            sendDirectMessage(activePartner.id, prompt)
                          }
                          className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  groupedMessages.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-3">
                      {/* Date Divider */}
                      <div className="relative flex items-center justify-center my-3">
                        <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                        <span className="bg-white dark:bg-zinc-950 px-2.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider shrink-0">
                          {group.dateLabel}
                        </span>
                      </div>

                      {/* Group Message Bubbles */}
                      {group.items.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            {!isMe && (
                              <Avatar className="h-6 w-6 shrink-0 mb-1">
                                <AvatarImage
                                  src={activePartner.avatarUrl}
                                  alt={activePartner.name}
                                />
                                <AvatarFallback className="text-[10px]">
                                  {activePartner.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 shadow-2xs ${
                                isMe
                                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-br-xs"
                                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100 rounded-bl-xs border border-zinc-200/50 dark:border-zinc-700/50"
                              }`}
                            >
                              <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                  isMe
                                    ? "text-zinc-400 dark:text-zinc-500"
                                    : "text-zinc-400 dark:text-zinc-500"
                                }`}
                              >
                                <span>{formatChatTime(msg.createdAt)}</span>
                                {isMe && (
                                  <span>
                                    {msg.isRead ? (
                                      <CheckCheck className="h-3 w-3 text-blue-400 dark:text-blue-600 inline" />
                                    ) : (
                                      <Check className="h-3 w-3 inline text-zinc-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Interactive Composer (firmly pinned to bottom) */}
              <div className="shrink-0 p-2.5 sm:p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20 space-y-2">
                {/* Quick Prompts Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {QUICK_PROMPTS.slice(0, 4).map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(prompt)}
                      className="px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2"
                >
                  <div className="relative flex-1">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${activePartner.name}... (Press Enter to send)`}
                      rows={1}
                      className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 placeholder:text-zinc-400 min-h-[38px] max-h-24 leading-normal"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    size="sm"
                    className="h-[38px] px-3.5 gap-1.5 shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <MessageSquare className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Select a Teammate
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Choose a colleague from the list on the left to start or
                continue your 1-on-1 direct message conversation.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
