"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Save, X } from "lucide-react";

interface EmployeeProfileData {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  jobTitle: string;
  department: string;
  dateOfJoining: string | Date;
  profilePictureUrl?: string | null;
}

interface ProfileEditFormProps {
  profile: EmployeeProfileData;
  currentUserRole: "ADMIN" | "EMPLOYEE";
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProfileEditForm({
  profile,
  currentUserRole,
  onSuccess,
  onCancel,
}: ProfileEditFormProps) {
  const isAdmin = currentUserRole === "ADMIN";

  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [jobTitle, setJobTitle] = useState(profile.jobTitle || "");
  const [department, setDepartment] = useState(profile.department || "");
  const [dateOfJoining, setDateOfJoining] = useState(
    profile.dateOfJoining
      ? new Date(profile.dateOfJoining).toISOString().split("T")[0]
      : ""
  );
  const [phone, setPhone] = useState(profile.phone || "");
  const [address, setAddress] = useState(profile.address || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    profile.profilePictureUrl || ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = isAdmin ? `/api/employees/${profile.id}` : `/api/employees/me`;

      const payload = isAdmin
        ? {
            firstName,
            lastName,
            jobTitle,
            department,
            dateOfJoining,
            phone: phone || null,
            address: address || null,
            profilePictureUrl: profilePictureUrl || null,
          }
        : {
            phone: phone || null,
            address: address || null,
            profilePictureUrl: profilePictureUrl || null,
          };

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update profile");
        setIsLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Name Fields (Admin Only Editable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" required={isAdmin}>
            First Name {!isAdmin && <span className="text-xs font-normal text-ink-muted">(Read-only)</span>}
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={!isAdmin}
            required={isAdmin}
          />
        </div>

        <div>
          <Label htmlFor="lastName" required={isAdmin}>
            Last Name {!isAdmin && <span className="text-xs font-normal text-ink-muted">(Read-only)</span>}
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={!isAdmin}
            required={isAdmin}
          />
        </div>
      </div>

      {/* Organization Fields (Admin Only Editable) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="jobTitle" required={isAdmin}>
            Job Title {!isAdmin && <span className="text-xs font-normal text-ink-muted">(Read-only)</span>}
          </Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={!isAdmin}
            required={isAdmin}
          />
        </div>

        <div>
          <Label htmlFor="department" required={isAdmin}>
            Department {!isAdmin && <span className="text-xs font-normal text-ink-muted">(Read-only)</span>}
          </Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={!isAdmin}
            required={isAdmin}
          />
        </div>

        <div>
          <Label htmlFor="dateOfJoining" required={isAdmin}>
            Date of Joining {!isAdmin && <span className="text-xs font-normal text-ink-muted">(Read-only)</span>}
          </Label>
          <Input
            id="dateOfJoining"
            type="date"
            value={dateOfJoining}
            onChange={(e) => setDateOfJoining(e.target.value)}
            disabled={!isAdmin}
            required={isAdmin}
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* Self-Service Contact Fields (Editable by Both Employee & Admin) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-accent-teal" /> Contact & Media Details (Self-Service Editable)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
            <Input
              id="profilePictureUrl"
              placeholder="https://images.unsplash.com/..."
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Residential Address</Label>
          <Input
            id="address"
            placeholder="Flat No, Street, City, State, Pincode"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          <Save className="w-4 h-4 mr-1" /> Save Changes
        </Button>
      </div>
    </form>
  );
}
