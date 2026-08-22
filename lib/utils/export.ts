import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AttendanceRecordItem } from "@/components/attendance/AttendanceTable";

export function exportAttendanceToPDF(
  records: AttendanceRecordItem[],
  monthLabel: string
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Attendance Report - ${monthLabel}`, 14, 22);

  const tableData = records.map((record) => [
    new Date(record.date).toLocaleDateString(),
    record.status,
    record.checkIn || "-",
    record.checkOut || "-",
    record.hoursWorked?.toFixed(2) || "-",
  ]);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Status", "Check-In", "Check-Out", "Hours Worked"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [91, 79, 233] },
  });

  doc.save(`attendance_${monthLabel.replace(/\s+/g, "_")}.pdf`);
}

export function exportAttendanceToCSV(
  records: AttendanceRecordItem[],
  monthLabel: string
) {
  const headers = ["Date", "Status", "Check-In", "Check-Out", "Hours Worked"];

  const csvRows = [];
  csvRows.push(headers.join(","));

  records.forEach((record) => {
    const row = [
      new Date(record.date).toLocaleDateString(),
      record.status,
      record.checkIn || "-",
      record.checkOut || "-",
      record.hoursWorked?.toFixed(2) || "-",
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `attendance_${monthLabel.replace(/\s+/g, "_")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
