"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({
    presentToday: 0,
    halfDayToday: 0,
    absentToday: 0,
    leaveToday: 0,
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees list for dropdown filter
  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmployees(data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching employees list:", err));
  }, []);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedEmployee !== "ALL") params.set("employeeId", selectedEmployee);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/admin/attendance?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load master attendance log");
        setIsLoading(false);
        return;
      }

      setRecords(data.data.records || []);
      setKpis(data.data.kpis || {});
    } catch {
      setError("Network error loading attendance logs");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmployee, selectedStatus, startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const resetFilters = () => {
    setSelectedEmployee("ALL");
    setSelectedStatus("ALL");
    setStartDate("");
    setEndDate("");
  };

  return (
    <AppShell activeItem="attendance">
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink flex items-center gap-2">
              <Clock className="w-7 h-7 text-primary" /> Master Attendance Overview
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Monitor daily employee turnouts, check-in/out timestamps, and filter attendance logs across the organization.
            </p>
          </div>

          <button
            onClick={fetchAttendance}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-canvas hover:bg-primary-soft text-ink flex items-center gap-1.5 border border-border"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* Today KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-teal" /> Present Today
            </div>
            <div className="text-2xl font-extrabold text-accent-teal">{kpis.presentToday || 0}</div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent-amber" /> Half-Day Today
            </div>
            <div className="text-2xl font-extrabold text-accent-amber">{kpis.halfDayToday || 0}</div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-danger" /> Absent Today
            </div>
            <div className="text-2xl font-extrabold text-danger">{kpis.absentToday || 0}</div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <div className="text-xs text-ink-muted font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> On Leave Today
            </div>
            <div className="text-2xl font-extrabold text-primary">{kpis.leaveToday || 0}</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card p-4 space-y-3">
          <div className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-primary" /> Filter Attendance Logs
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-ink-muted block mb-1">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-ink-muted block mb-1">Attendance Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent</option>
                <option value="LEAVE">On Leave</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-ink-muted block mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-ink-muted block mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {(selectedEmployee !== "ALL" || selectedStatus !== "ALL" || startDate || endDate) && (
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-danger hover:underline pt-1"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Master Log Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-ink-muted">Filtering attendance records...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center glass-card text-danger border-danger/30">
            {error}
          </div>
        ) : (
          <AttendanceTable records={records} showEmployeeColumn={true} />
        )}
      </div>
    </AppShell>
  );
}
