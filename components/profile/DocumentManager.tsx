"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Loader2,
} from "lucide-react";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/validators/document";

interface DocumentData {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  fileSizeKb?: number | null;
  mimeType?: string | null;
  uploadedAt: string | Date;
}

interface DocumentManagerProps {
  employeeId: string;
  documents: DocumentData[];
  onDocumentUpdated?: () => void;
}

export function DocumentManager({ employeeId, documents, onDocumentUpdated }: DocumentManagerProps) {
  const [docType, setDocType] = useState("ID_PROOF");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB per Security doc §3)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File size exceeds the 5MB limit.");
      setSelectedFile(null);
      return;
    }

    // Validate type (PDF, PNG, JPEG only per Security doc §3)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Unsupported file format. Only PDF, PNG, and JPEG/JPG are allowed.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("docType", docType);
      formData.append("employeeId", employeeId);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to upload document");
        setIsUploading(false);
        return;
      }

      setSuccessMsg("Document uploaded successfully!");
      setSelectedFile(null);
      onDocumentUpdated?.();
    } catch {
      setError("Network error uploading document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(docId);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to delete document");
        setDeletingId(null);
        return;
      }

      onDocumentUpdated?.();
    } catch {
      setError("Network error deleting document.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Document Upload Card ─────────────────────────── */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-primary" /> Upload New Document
        </h3>
        <p className="text-xs text-ink-muted">
          Allowed formats: <strong>PDF, PNG, JPEG</strong> • Maximum file size: <strong>5MB</strong>
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="docType">Document Category</Label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ID_PROOF">ID Proof (Aadhaar / Passport / PAN)</option>
              <option value="TAX_FORM">Tax Document (Form 16)</option>
              <option value="CONTRACT">Employment Contract</option>
              <option value="CERTIFICATE">Education / Certification</option>
              <option value="OTHER">Other Official File</option>
            </select>
          </div>

          <div>
            <Label htmlFor="file">Select File (≤ 5MB)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              className="cursor-pointer text-xs"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              className="w-full"
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Upload Document
            </Button>
          </div>
        </form>
      </div>

      {/* ── Document List Card ─────────────────────────── */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-ink flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-accent-teal" /> Uploaded Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="text-center py-10 text-ink-muted text-sm border-2 border-dashed border-border rounded-xl">
            <FileText className="w-10 h-10 mx-auto text-ink-light mb-2 opacity-50" />
            No documents uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{doc.fileName}</div>
                    <div className="text-xs text-ink-muted flex items-center gap-2">
                      <span className="font-semibold text-primary">{doc.docType}</span>
                      <span>•</span>
                      <span>{doc.fileSize ?? doc.fileSizeKb ? `${doc.fileSize ?? doc.fileSizeKb} KB` : "N/A"}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-ink-secondary hover:text-primary hover:bg-canvas transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" /> View
                  </a>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-soft/50 transition-colors"
                    title="Delete document"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-danger" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
