"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

export interface AttendanceWidgetRecord {
  id?: string;
  checkIn?: string | Date | null;
  checkOut?: string | Date | null;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
}

interface AttendanceWidgetProps {
  todayRecord: AttendanceWidgetRecord | null;
  onStatusUpdated?: () => void;
}

export function AttendanceWidget({ todayRecord, onStatusUpdated }: AttendanceWidgetProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/check-in", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Check-in failed");
        setIsLoading(false);
        return;
      }

      onStatusUpdated?.();
    } catch {
      setError("Network error during check-in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/check-out", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Check-out failed");
        setIsLoading(false);
        return;
      }

      onStatusUpdated?.();
    } catch {
      setError("Network error during check-out");
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckedIn = !!todayRecord?.checkIn;
  const isCheckedOut = !!todayRecord?.checkOut;

  const checkInTime = todayRecord?.checkIn
    ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const checkOutTime = todayRecord?.checkOut
    ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Live Clock Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> {currentDate}
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-ink font-mono tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary animate-pulse" />
            {currentTime || "--:--:-- --"}
          </div>
          <div className="text-xs text-ink-muted">Standard Workday Hours: 09:00 AM – 06:00 PM</div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {!isCheckedIn ? (
            <Button
              onClick={handleCheckIn}
              isLoading={isLoading}
              className="w-full sm:w-auto bg-secondary hover:bg-secondary-dark text-white font-bold h-11 px-6 shadow-xs"
            >
              <LogIn className="w-4 h-4 mr-2" /> Check In Now
            </Button>
          ) : !isCheckedOut ? (
            <Button
              onClick={handleCheckOut}
              isLoading={isLoading}
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold h-11 px-6 shadow-xs"
            >
              <LogOut className="w-4 h-4 mr-2" /> Check Out Now
            </Button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary-soft text-secondary font-bold text-sm border border-secondary/30">
              <CheckCircle2 className="w-4 h-4" /> Shift Completed Today
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Today Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
        <div className="p-3 rounded-xl bg-canvas border border-border">
          <div className="text-[11px] text-ink-muted font-medium">Check-In Time</div>
          <div className="text-sm font-bold text-ink mt-0.5">{checkInTime || "--:--"}</div>
        </div>

        <div className="p-3 rounded-xl bg-canvas border border-border">
          <div className="text-[11px] text-ink-muted font-medium">Check-Out Time</div>
          <div className="text-sm font-bold text-ink mt-0.5">{checkOutTime || "--:--"}</div>
        </div>

        <div className="p-3 rounded-xl bg-canvas border border-border">
          <div className="text-[11px] text-ink-muted font-medium">Today Status</div>
          <div className="text-sm font-bold mt-0.5">
            {todayRecord ? (
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                  todayRecord.status === "PRESENT"
                    ? "badge-present"
                    : todayRecord.status === "HALF_DAY"
                    ? "badge-half-day"
                    : "badge-leave"
                }`}
              >
                {todayRecord.status}
              </span>
            ) : (
              <span className="text-ink-muted font-normal text-xs">Not Checked In</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-canvas border border-border">
          <div className="text-[11px] text-ink-muted font-medium">Shift Status</div>
          <div className="text-xs font-bold text-ink mt-1">
            {isCheckedOut ? "Completed" : isCheckedIn ? "Active Shift" : "Pending Start"}
          </div>
        </div>
      </div>
    </div>
  );
}
