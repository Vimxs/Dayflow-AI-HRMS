"use client";

import React, { useState } from "react";
import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import {
  User,
  Briefcase,
  DollarSign,
  FileText,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit2,
  Mail,
  Building2,
  Award,
} from "lucide-react";
import { ProfileEditForm } from "./ProfileEditForm";
import { DocumentManager } from "./DocumentManager";

interface EmployeeProfileData {
  id: string;
  userId: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  jobTitle: string;
  department: string;
  dateOfJoining: string | Date;
  profilePictureUrl?: string | null;
  payroll?: {
    baseSalary: number | string;
    allowances: number | string;
    deductions: number | string;
    effectiveFrom: string | Date;
  } | null;
  documents?: Array<{
    id: string;
    docType: string;
    fileName: string;
    fileUrl: string;
    fileSizeKb?: number | null;
    mimeType?: string | null;
    uploadedAt: string | Date;
  }>;
}

interface ProfileViewProps {
  profile: EmployeeProfileData;
  currentUserRole: "ADMIN" | "EMPLOYEE";
  onProfileUpdated?: () => void;
}

export function ProfileView({ profile, currentUserRole, onProfileUpdated }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "job" | "salary" | "documents">("personal");
  const [isEditing, setIsEditing] = useState(false);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const dateFormatted = new Date(profile.dateOfJoining).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ── Profile Hero Header ─────────────────────────── */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-soft/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-painted-header text-white flex items-center justify-center font-bold text-2xl md:text-3xl shadow-lg border-2 border-white/80 overflow-hidden flex-shrink-0">
              {profile.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePictureUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span>
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{fullName}</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary border border-primary/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {profile.role}
                </span>
              </div>
              <p className="text-sm font-medium text-ink-secondary flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                {profile.jobTitle} • <span className="text-primary font-semibold">{profile.department}</span>
              </p>
              <p className="text-xs text-ink-muted flex items-center gap-3 pt-1">
                <span>Code: <strong className="text-ink">{profile.employeeCode}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? "Cancel Editing" : currentUserRole === "ADMIN" ? "Edit Full Profile" : "Edit Contact Info"}
          </Button>
        </div>
      </div>

      {/* ── Edit Form View vs Tabbed View ────────────────── */}
      {isEditing ? (
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            {currentUserRole === "ADMIN" ? "Admin Profile Modification" : "Update Contact Details"}
          </h2>
          <ProfileEditForm
            profile={profile}
            currentUserRole={currentUserRole}
            onSuccess={() => {
              setIsEditing(false);
              onProfileUpdated?.();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "personal"
                  ? "bg-primary text-white shadow-md"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas"
              }`}
            >
              <User className="w-4 h-4" /> Personal Information
            </button>

            <button
              onClick={() => setActiveTab("job")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "job"
                  ? "bg-primary text-white shadow-md"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Job & Organization
            </button>

            <button
              onClick={() => setActiveTab("salary")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "salary"
                  ? "bg-primary text-white shadow-md"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas"
              }`}
            >
              <DollarSign className="w-4 h-4" /> Salary & Benefits
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "documents"
                  ? "bg-primary text-white shadow-md"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas"
              }`}
            >
              <FileText className="w-4 h-4" /> Documents ({profile.documents?.length || 0})
            </button>
          </div>

          {/* Tab 1: Personal Information */}
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5 space-y-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Full Name</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> {fullName}
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Corporate Email</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> {profile.email}
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Phone Number</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent-teal" />
                  {profile.phone || <span className="text-ink-muted italic font-normal">Not provided</span>}
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Residential Address</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-coral" />
                  {profile.address || <span className="text-ink-muted italic font-normal">Not provided</span>}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Job & Organization */}
          {activeTab === "job" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 space-y-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Employee Code</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> {profile.employeeCode}
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Designation / Role</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> {profile.jobTitle}
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Department</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent-teal" /> {profile.department}
                </div>
              </div>

              <div className="glass-card p-5 space-y-3 md:col-span-3">
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Date of Joining</div>
                <div className="text-sm font-bold text-ink flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent-coral" /> {dateFormatted}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Salary & Benefits */}
          {activeTab === "salary" && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent-teal" /> Compensation Details
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-accent-teal-soft text-accent-teal">
                  Role-Gated Confidential
                </span>
              </div>

              {profile.payroll ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-canvas border border-border">
                    <div className="text-xs text-ink-muted font-medium mb-1">Base Salary</div>
                    <div className="text-2xl font-bold text-ink">
                      ₹{Number(profile.payroll.baseSalary).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-1">Per annum</div>
                  </div>

                  <div className="p-4 rounded-xl bg-accent-teal-soft/40 border border-accent-teal/20">
                    <div className="text-xs text-accent-teal font-semibold mb-1">Allowances</div>
                    <div className="text-2xl font-bold text-accent-teal">
                      +₹{Number(profile.payroll.allowances).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-1">Special & HRA</div>
                  </div>

                  <div className="p-4 rounded-xl bg-danger-soft/40 border border-danger/20">
                    <div className="text-xs text-danger font-semibold mb-1">Deductions</div>
                    <div className="text-2xl font-bold text-danger">
                      -₹{Number(profile.payroll.deductions).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-1">TDS & PF</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-ink-muted text-sm">
                  No payroll structure configured yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Documents */}
          {activeTab === "documents" && (
            <DocumentManager
              employeeId={profile.id}
              documents={profile.documents || []}
              onDocumentUpdated={onProfileUpdated}
            />
          )}
        </div>
      )}
    </div>
  );
}
