"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Phone,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Download,
  Activity,
} from "lucide-react";

interface EmployeeDetailData {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    jobTitle: string;
    phone: string | null;
    address: string | null;
    profilePictureUrl: string | null;
    dateOfJoining: string;
    isVerified: boolean;
    createdAt: string;
  };
  payroll: {
    id: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    effectiveFrom: string;
  } | null;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    docType: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    metadata: string | null;
  }>;
}

export default function AdminEmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<EmployeeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form edit states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [baseSalary, setBaseSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Document upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState("ID_PROOF");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/admin/employees/${id}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/sign-in");
        if (res.status === 403) router.push("/employee/dashboard");
        throw new Error("Failed to load employee record");
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        const emp = json.data.employee;
        const pay = json.data.payroll;
        setFirstName(emp.firstName || "");
        setLastName(emp.lastName || "");
        setDepartment(emp.department || "ENGINEERING");
        setJobTitle(emp.jobTitle || "");
        setPhone(emp.phone || "");
        setAddress(emp.address || "");
        setRole(emp.role || "EMPLOYEE");
        if (pay) {
          setBaseSalary(pay.baseSalary?.toString() || "");
          setAllowances(pay.allowances?.toString() || "0");
          setDeductions(pay.deductions?.toString() || "0");
        }
      } else {
        setError(json.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading employee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          department,
          jobTitle,
          phone,
          address,
          role,
          baseSalary: baseSalary ? parseFloat(baseSalary) : undefined,
          allowances: allowances ? parseFloat(allowances) : undefined,
          deductions: deductions ? parseFloat(deductions) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to update employee");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        fetchEmployee();
      }
    } catch {
      setError("Network error while updating employee");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", selectedDocType);
    formData.append("employeeId", id);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setUploadError(json.error || "Failed to upload document");
      } else {
        fetchEmployee();
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setUploadError("Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to remove this document?")) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) fetchEmployee();
    } catch {
      alert("Failed to delete document");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <header className="h-16 border-b border-border bg-white/60" />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full animate-pulse space-y-6">
          <div className="h-32 rounded-2xl bg-surface-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-surface-muted" />
            <div className="h-64 rounded-2xl bg-surface-muted" />
          </div>
        </main>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
        <div className="glass-card max-w-md w-full p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h2 className="font-heading font-bold text-lg text-ink">Employee Not Found</h2>
          <p className="text-xs text-ink-secondary">{error}</p>
          <Button onClick={() => router.push("/admin/employees")} size="sm">
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  const { employee, documents, auditLogs } = data!;
  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <AppHeader
        user={{
          email: "admin@dayflow.com",
          role: "ADMIN",
          employee: {
            firstName: "Anita",
            lastName: "Roy",
            jobTitle: "HR Operations Lead",
            department: "Human Resources",
            employeeCode: "EMP001",
          },
        }}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/admin/employees"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Directory
          </Link>
        </div>

        {/* Profile Header Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#EDEBFF] via-[#F4F1FF] to-[#FFF0EC] border border-primary/15 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-heading font-bold text-3xl shadow-md shadow-primary/20 flex-shrink-0">
              {employee.firstName.charAt(0)}
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-heading font-bold text-ink">{fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold border border-primary/20">
                  {employee.employeeCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-ink font-semibold text-[11px] border border-border">
                  {employee.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-secondary">
                {employee.jobTitle} &bull; {employee.department} Department &bull; {employee.email}
              </p>
              <p className="text-xs text-ink-light flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Joined{" "}
                {new Date(employee.dateOfJoining).toLocaleDateString()} &bull; ID: {employee.id}
              </p>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">
              Employee profile and audit trail updated successfully!
            </span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Column 1: Personal & Role Details */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <User className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-bold text-base text-ink">
                  Personal & Role Settings
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-xs">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-ink-light absolute left-3 top-3" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role" className="text-xs">System Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border px-3 bg-white text-xs text-ink"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">HR Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-xs">Address</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-ink-light absolute left-3 top-3" />
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Form Column 2: Job & Compensation Settings */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Building2 className="w-4 h-4 text-accent-teal" />
                <h2 className="font-heading font-bold text-base text-ink">
                  Job & Compensation Structure
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="department" className="text-xs">Department</Label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border px-3 bg-white text-xs text-ink"
                  >
                    <option value="ENGINEERING">Engineering</option>
                    <option value="SALES">Sales</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="FINANCE">Finance</option>
                    <option value="OPERATIONS">Operations</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="jobTitle" className="text-xs">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <Label htmlFor="baseSalary" className="text-xs">Base Salary ($)</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="allowances" className="text-xs">Allowances ($)</Label>
                  <Input
                    id="allowances"
                    type="number"
                    value={allowances}
                    onChange={(e) => setAllowances(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="deductions" className="text-xs">Deductions ($)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary-soft/60 border border-primary/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Net Monthly Compensation:</span>
                <span className="font-heading font-bold text-sm text-primary">
                  $
                  {(
                    (parseFloat(baseSalary) || 0) +
                    (parseFloat(allowances) || 0) -
                    (parseFloat(deductions) || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="submit"
              size="sm"
              isLoading={isSaving}
              className="shadow-sm shadow-primary/20"
            >
              Save Employee Changes (Audit Logged)
            </Button>
          </div>
        </form>

        {/* 2-Column Bottom: Document Repository + Audit History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Repository */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-coral" />
                <h2 className="font-heading font-bold text-base text-ink">
                  Employee Documents
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="text-xs rounded-lg border border-border px-2 py-1 bg-white text-ink"
                >
                  <option value="ID_PROOF">ID Proof</option>
                  <option value="OFFER_LETTER">Offer Letter</option>
                  <option value="TAX_DOC">Tax Form</option>
                  <option value="GENERAL">General</option>
                </select>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                  className="text-xs flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-danger bg-danger-soft p-2 rounded-lg">{uploadError}</p>
            )}

            <div className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden bg-white max-h-60 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-muted">
                  No documents uploaded for this employee.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-canvas/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-ink block truncate">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {doc.docType} &bull; {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-border hover:border-primary/40 text-primary"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg border border-border hover:border-danger/40 text-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Log Trail */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-bold text-base text-ink">
                Security & Audit Trail
              </h2>
            </div>
            <p className="text-xs text-ink-muted">
              Immutable audit history of all changes made to this employee record
            </p>

            <div className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden bg-white max-h-60 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-muted">
                  No audit logs recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-ink-light">
                        {new Date(log.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {log.metadata && (
                      <p className="text-[10px] text-ink-muted font-mono bg-canvas p-1.5 rounded truncate">
                        {log.metadata}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
