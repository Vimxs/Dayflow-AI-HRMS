"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  DollarSign,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Download,
  Lock,
} from "lucide-react";

interface ProfileData {
  profile: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string | null;
    address: string | null;
    jobTitle: string;
    department: string;
    dateOfJoining: string;
    profilePictureUrl: string | null;
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
}

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for editable fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Document upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState("ID_PROOF");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) router.push("/sign-in");
          throw new Error("Failed to load profile");
        }
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setData(json.data);
          setPhone(json.data.profile.phone || "");
          setAddress(json.data.profile.address || "");
        } else {
          setError(json.error);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to update profile");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch {
      setError("An unexpected network error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds the 5MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", selectedDocType);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setUploadError(json.error || "Failed to upload document");
      } else {
        setData((prev) =>
          prev
            ? {
                ...prev,
                documents: [json.data.document, ...prev.documents],
              }
            : null
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setUploadError("Network error during file upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to remove this document?")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                documents: prev.documents.filter((d) => d.id !== id),
              }
            : null
        );
      }
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
          <h2 className="font-heading font-bold text-lg text-ink">Profile Error</h2>
          <p className="text-xs text-ink-secondary">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { profile, payroll, documents } = data!;
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <AppHeader
        user={{
          email: profile.email,
          role: profile.role,
          employee: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            jobTitle: profile.jobTitle,
            department: profile.department,
            employeeCode: profile.employeeCode,
          },
        }}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/employee/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>

        {/* Profile Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#EDEBFF] via-[#F4F1FF] to-[#E6F8F5] border border-primary/15 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-accent-teal text-white flex items-center justify-center font-heading font-bold text-3xl shadow-md shadow-accent-teal/20 flex-shrink-0">
              {profile.firstName.charAt(0)}
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-heading font-bold text-ink">{fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-accent-teal-soft text-accent-teal text-[11px] font-bold border border-accent-teal/20">
                  {profile.employeeCode}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-secondary">
                {profile.jobTitle} &bull; {profile.department} Department
              </p>
              <p className="text-xs text-ink-light flex items-center justify-center sm:justify-start gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-teal" /> Verified Corporate Employee &bull; Joined{" "}
                {new Date(profile.dateOfJoining).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Save Status Banners */}
        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">Contact details updated successfully!</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Personal & Contact Details (Editable) */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h2 className="font-heading font-bold text-base text-ink">
                    Personal Information
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary-soft">
                  Self-Editable
                </span>
              </div>
              <p className="text-xs text-ink-muted mb-4">
                Keep your phone and residential contact details up to date
              </p>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-xs">Corporate Email (Read-only)</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-surface-muted text-xs cursor-not-allowed opacity-75"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-ink-light absolute left-3 top-3" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-xs">Residential Address</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-ink-light absolute left-3 top-3" />
                    <Input
                      id="address"
                      placeholder="e.g. 123 Tech Blvd, Austin, TX"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full text-xs"
                    isLoading={isSaving}
                  >
                    Save Contact Information
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Card 2: Employment & Job Scope (Read-only) */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent-teal" />
                  <h2 className="font-heading font-bold text-base text-ink">
                    Employment Details
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-ink-muted px-2 py-0.5 rounded-full bg-surface-muted flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Managed by HR
                </span>
              </div>
              <p className="text-xs text-ink-muted mb-4">
                Organizational placement and official employment records
              </p>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-canvas border border-border/80 flex items-center justify-between">
                  <span className="text-ink-muted">Employee Code</span>
                  <span className="font-mono font-bold text-ink">{profile.employeeCode}</span>
                </div>

                <div className="p-3 rounded-xl bg-canvas border border-border/80 flex items-center justify-between">
                  <span className="text-ink-muted">Department</span>
                  <span className="font-semibold text-ink">{profile.department}</span>
                </div>

                <div className="p-3 rounded-xl bg-canvas border border-border/80 flex items-center justify-between">
                  <span className="text-ink-muted">Job Title / Designation</span>
                  <span className="font-semibold text-ink">{profile.jobTitle}</span>
                </div>

                <div className="p-3 rounded-xl bg-canvas border border-border/80 flex items-center justify-between">
                  <span className="text-ink-muted">Date of Joining</span>
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent-teal" />
                    {new Date(profile.dateOfJoining).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-canvas border border-border/80 flex items-center justify-between">
                  <span className="text-ink-muted">System Role</span>
                  <span className="font-semibold text-primary">{profile.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Role-Gated Salary Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <h2 className="font-heading font-bold text-base text-ink">
                Salary & Compensation Structure
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft">
              Confidential
            </span>
          </div>

          {!payroll ? (
            <div className="py-6 text-center text-xs text-ink-muted">
              Salary structure is being configured by HR Operations.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-ink-muted block">Base Salary</span>
                <span className="text-xl font-heading font-bold text-ink block mt-1">
                  ${payroll.baseSalary.toLocaleString()}
                </span>
                <span className="text-[10px] text-ink-light">Monthly standard</span>
              </div>

              <div className="p-4 rounded-xl bg-accent-teal-soft/40 border border-accent-teal/20">
                <span className="text-xs text-accent-teal block">Allowances (+)</span>
                <span className="text-xl font-heading font-bold text-accent-teal block mt-1">
                  +${payroll.allowances.toLocaleString()}
                </span>
                <span className="text-[10px] text-accent-teal/80">HRA, Medical, Travel</span>
              </div>

              <div className="p-4 rounded-xl bg-danger-soft/40 border border-danger/20">
                <span className="text-xs text-danger block">Deductions (-)</span>
                <span className="text-xl font-heading font-bold text-danger block mt-1">
                  -${payroll.deductions.toLocaleString()}
                </span>
                <span className="text-[10px] text-danger/80">Tax & Provident Fund</span>
              </div>

              <div className="p-4 rounded-xl bg-primary-soft border border-primary/30">
                <span className="text-xs font-semibold text-primary block">Net Take-Home</span>
                <span className="text-xl font-heading font-bold text-primary block mt-1">
                  ${payroll.netSalary.toLocaleString()}
                </span>
                <span className="text-[10px] text-primary/80">Per calendar month</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Document Repository (T3.4) */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-coral" />
                <h2 className="font-heading font-bold text-base text-ink">
                  Document Repository
                </h2>
              </div>
              <p className="text-xs text-ink-muted">
                Official documents, ID proofs, and offer letters (Max 5MB: PDF, PNG, JPEG)
              </p>
            </div>

            {/* Document Upload Widget */}
            <div className="flex items-center gap-2">
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="text-xs rounded-lg border border-border px-2.5 py-1.5 bg-white text-ink"
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
                id="doc-upload"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                className="text-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </Button>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Document List */}
          <div className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden bg-white">
            {documents.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted">
                No documents uploaded yet.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-canvas/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-ink block truncate">
                        {doc.fileName}
                      </span>
                      <span className="text-[11px] text-ink-muted">
                        {doc.docType} &bull; {(doc.fileSize / 1024).toFixed(1)} KB &bull;{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-border hover:border-primary/40 text-primary transition-colors"
                      title="Download/View"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg border border-border hover:border-danger/40 text-danger transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
