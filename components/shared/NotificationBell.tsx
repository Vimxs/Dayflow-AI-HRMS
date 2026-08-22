"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, Clock, Info, Calendar, DollarSign, CheckCheck } from "lucide-react";

interface NotificationItem {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      // Graceful silence on background notification fetch failure
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  const markSingleAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Handle silently
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "LEAVE":
      case "LEAVE_STATUS":
        return <Calendar className="w-3.5 h-3.5 text-primary" />;
      case "PAYROLL":
        return <DollarSign className="w-3.5 h-3.5 text-accent-teal" />;
      case "ATTENDANCE":
        return <Clock className="w-3.5 h-3.5 text-accent-amber" />;
      default:
        return <Info className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface border border-border/60 hover:border-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <Bell className="w-4 h-4 text-ink-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-coral text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-border shadow-xl shadow-primary/10 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-3.5 bg-canvas border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-ink">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[10px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={loading}
                className="text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-ink">All caught up!</p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  No new notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markSingleAsRead(n.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                    n.isRead
                      ? "bg-white hover:bg-canvas/60 opacity-80"
                      : "bg-primary-soft/30 hover:bg-primary-soft/50 font-medium"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${n.isRead ? "text-ink-secondary" : "text-ink font-semibold"}`}>
                      {n.message}
                    </p>
                    <span className="text-[10px] text-ink-light block mt-1">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span
                      title="Mark as read"
                      className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"
                    />
                  )}
                  {n.isRead && (
                    <Check className="w-3 h-3 text-ink-light flex-shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
