"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { AttendanceWidget, type AttendanceWidgetRecord } from "@/components/attendance/AttendanceWidget";
import { AttendanceTable, type AttendanceRecordItem } from "@/components/attendance/AttendanceTable";
import { exportAttendanceToPDF, exportAttendanceToCSV } from "@/lib/utils/export";
import { Clock, Calendar, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
}

export default function EmployeeAttendancePage() {
  const [todayRecord, setTodayRecord] = useState<AttendanceWidgetRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecordItem[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    halfDays: 0,
    absentDays: 0,
    leaveDays: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = async () => {
    try {
      const res = await fetch("/api/attendance/today");
      const data = await res.json();
      if (res.ok && data.success) {
        setTodayRecord(data.data);
      }
    } catch (err) {
      console.error("Error fetching today status:", err);
    }
  };

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/history");
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load attendance history");
        setIsLoading(false);
        return;
      }

      setHistory(data.data.records || []);
      setStats(data.data.stats || {});
    } catch {
      setError("Network error loading attendance history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAll = () => {
    fetchToday();
    fetchHistory();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppShell activeItem="attendance">
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-ink flex items-center gap-2">
              <Clock className="w-7 h-7 text-primary" /> Attendance & Time Tracker
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Log daily check-in/out hours, view work duration, and monitor monthly attendance records.
            </p>
          </div>
        </div>

        {/* Check-In / Check-Out Widget */}
        <AttendanceWidget todayRecord={todayRecord} onStatusUpdated={refreshAll} />

        {/* Attendance Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-teal" /> Days Present
            </div>
            <div className="text-2xl font-extrabold text-accent-teal">{stats.presentDays || 0}</div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent-amber" /> Half Days
            </div>
            <div className="text-2xl font-extrabold text-accent-amber">{stats.halfDays || 0}</div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-danger" /> Days Absent
            </div>
            <div className="text-2xl font-extrabold text-danger">{stats.absentDays || 0}</div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> On Leave
            </div>
            <div className="text-2xl font-extrabold text-primary">{stats.leaveDays || 0}</div>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Attendance Log
            </h2>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs font-semibold mr-2">
                <span className="badge-present px-2 py-0.5 rounded">Present</span>
                <span className="badge-half-day px-2 py-0.5 rounded">Half Day</span>
                <span className="badge-absent px-2 py-0.5 rounded">Absent</span>
                <span className="badge-leave px-2 py-0.5 rounded">Leave</span>
              </div>
              <button
                onClick={() => exportAttendanceToPDF(history, "My_Attendance")}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-canvas hover:bg-primary-soft text-ink flex items-center gap-1 border border-border transition-colors"
                title="Export PDF"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              <button
                onClick={() => exportAttendanceToCSV(history, "My_Attendance")}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-canvas hover:bg-primary-soft text-ink flex items-center gap-1 border border-border transition-colors"
                title="Export CSV"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-ink-muted">Loading attendance history...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center glass-card text-danger border-danger/30">
              {error}
            </div>
          ) : (
            <AttendanceTable records={history} showEmployeeColumn={false} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
