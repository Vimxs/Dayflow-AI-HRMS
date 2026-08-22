import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FBFAFF",
    padding: 40,
    fontSize: 10,
    color: "#1A1B25",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#5B4FE9",
  },
  brand: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#5B4FE9" },
  brandSub: { fontSize: 8, color: "#6B7280", marginTop: 2 },
  slipTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  slipMonth: { fontSize: 10, color: "#6B7280", textAlign: "right", marginTop: 4 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#5B4FE9",
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#EDEBFF",
    borderRadius: 8,
    padding: 12,
  },
  infoItem: { width: "45%", marginBottom: 8, marginRight: "5%" },
  infoLabel: { fontSize: 8, color: "#6B7280", marginBottom: 2 },
  infoValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5F5",
  },
  tableLabel: { fontSize: 10 },
  tableAmount: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#5B4FE9",
    borderRadius: 8,
    marginTop: 8,
  },
  netLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  netAmount: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopColor: "#E7E5F5",
    paddingTop: 10,
  },
});

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface SalarySlipProps {
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    department: string;
    jobTitle: string;
    email: string;
    dateOfJoining: string;
  };
  payroll: {
    baseSalary: number;
    allowances: number;
    deductions: number;
    effectiveFrom: string;
  };
  month: string; // "YYYY-MM"
}

function SalarySlipDocument({ employee, payroll, month }: SalarySlipProps) {
  const [year, mon] = month.split("-");
  const monthLabel = new Date(`${year}-${mon}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const net = payroll.baseSalary + payroll.allowances - payroll.deductions;

  return (
    <Document
      title={`Salary Slip — ${employee.firstName} ${employee.lastName} — ${monthLabel}`}
      author="Dayflow HRMS"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Dayflow</Text>
            <Text style={styles.brandSub}>HRMS — Human Resource Management System</Text>
          </View>
          <View>
            <Text style={styles.slipTitle}>Salary Slip</Text>
            <Text style={styles.slipMonth}>{monthLabel}</Text>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMPLOYEE INFORMATION</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{employee.firstName} {employee.lastName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Employee Code</Text>
              <Text style={styles.infoValue}>{employee.employeeCode}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{employee.department}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Designation</Text>
              <Text style={styles.infoValue}>{employee.jobTitle}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Corporate Email</Text>
              <Text style={styles.infoValue}>{employee.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Joining</Text>
              <Text style={styles.infoValue}>
                {new Date(employee.dateOfJoining).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Salary Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SALARY BREAKDOWN</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Base Salary</Text>
            <Text style={styles.tableAmount}>{fmt(payroll.baseSalary)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Allowances (HRA + Medical + Travel)</Text>
            <Text style={[styles.tableAmount, { color: "#12B8A6" }]}>
              + {fmt(payroll.allowances)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Deductions (Tax + Provident Fund)</Text>
            <Text style={[styles.tableAmount, { color: "#E5484D" }]}>
              - {fmt(payroll.deductions)}
            </Text>
          </View>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net Take-Home Salary</Text>
            <Text style={styles.netAmount}>{fmt(net)}</Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={{ fontSize: 9, color: "#6B7280" }}>
            Salary structure effective from:{" "}
            {new Date(payroll.effectiveFrom).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            . This is a computer-generated payslip and does not require a signature.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Dayflow HRMS — Confidential — This document is for the recipient only.
          Generated on {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateSalarySlipPDF(props: SalarySlipProps): Promise<Buffer> {
  return renderToBuffer(<SalarySlipDocument {...props} />);
}
