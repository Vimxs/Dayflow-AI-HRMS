"use client";

import { Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export interface AttendanceRecordItem {
  id: string;
  date: string | Date;
  checkIn?: string | Date | null;
  checkOut?: string | Date | null;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  hoursWorked?: number | null;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    department: string;
    profilePictureUrl?: string | null;
  };
}

interface AttendanceTableProps {
  records: AttendanceRecordItem[];
  showEmployeeColumn?: boolean;
}

export function AttendanceTable({ records, showEmployeeColumn = false }: AttendanceTableProps) {
  const formatTime = (dateVal?: string | Date | null) => {
    if (!dateVal) return "--:--";
    return new Date(dateVal).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateHours = (checkIn?: string | Date | null, checkOut?: string | Date | null) => {
    if (!checkIn || !checkOut) return "--";
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diffMs <= 0) return "--";
    const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
    return `${hours} hrs`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <span className="badge-present px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Present</span>;
      case "HALF_DAY":
        return <span className="badge-half-day px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Half Day</span>;
      case "ABSENT":
        return <span className="badge-absent px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Absent</span>;
      case "LEAVE":
        return <span className="badge-leave px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> On Leave</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-canvas text-ink-muted">{status}</span>;
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-ink-muted text-sm glass-card border-dashed">
        <Clock className="w-10 h-10 mx-auto text-ink-light opacity-50 mb-2" />
        No attendance records found for the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-canvas/60 text-xs font-bold text-ink-muted uppercase tracking-wider">
              {showEmployeeColumn && <th className="p-4">Employee</th>}
              <th className="p-4">Date</th>
              <th className="p-4">Check-In</th>
              <th className="p-4">Check-Out</th>
              <th className="p-4">Work Duration</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {records.map((r) => {
              const dateFormatted = new Date(r.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr key={r.id} className="hover:bg-canvas/50 transition-colors">
                  {showEmployeeColumn && r.employee && (
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-painted-header text-white font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                          {r.employee.profilePictureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.employee.profilePictureUrl} alt={r.employee.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <span>
                              {r.employee.firstName[0]}
                              {r.employee.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-ink">{r.employee.firstName} {r.employee.lastName}</div>
                          <div className="text-xs text-ink-muted">{r.employee.jobTitle} • {r.employee.department}</div>
                        </div>
                      </div>
                    </td>
                  )}

                  <td className="p-4 font-semibold text-ink flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {dateFormatted}
                  </td>

                  <td className="p-4 font-mono text-xs text-ink font-medium">{formatTime(r.checkIn)}</td>
                  <td className="p-4 font-mono text-xs text-ink font-medium">{formatTime(r.checkOut)}</td>
                  <td className="p-4 font-semibold text-xs text-ink-secondary">{calculateHours(r.checkIn, r.checkOut)}</td>
                  <td className="p-4 text-right">{getStatusBadge(r.status)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
