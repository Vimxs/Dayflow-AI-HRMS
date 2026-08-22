"use client";

import { useState } from "react";
import Link from "next/link";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { label: "Weak", color: "var(--color-danger)", width: "33%" };
    if (score <= 4) return { label: "Medium", color: "var(--color-accent-amber)", width: "66%" };
    return { label: "Strong", color: "var(--color-accent-teal)", width: "100%" };
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.terms) {
      setErrorMsg("You must accept the terms and conditions.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Sign-up failed. Please check your inputs.");
      } else {
        setSuccessMsg(
          data.data?.message || "Sign-up successful! Check your email to verify your account."
        );
      }
    } catch {
      setErrorMsg("Network error. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="glass-card" style={{ padding: "2.5rem 2rem", textAlign: "center", maxWidth: "440px", margin: "0 auto" }}>
        <div style={{ fontSize: "48px", marginBottom: "1rem" }}>✉️</div>
        <h2 style={{ color: "var(--color-primary)", marginBottom: "0.75rem" }}>Verify Your Email</h2>
        <p style={{ color: "var(--color-ink)", marginBottom: "1.5rem", fontSize: "14px" }}>
          {successMsg}
        </p>
        <p className="caption" style={{ marginBottom: "2rem" }}>
          In dev mode, check your terminal console output for the verification link.
        </p>
        <Link
          href="/sign-in"
          style={{
            display: "inline-block",
            background: "var(--color-primary)",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-btn)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: "2.5rem 2rem", width: "100%", maxWidth: "460px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div className="gradient-tile" style={{ width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "20px" }}>
          ✨
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-ink)", marginBottom: "0.25rem" }}>
          Join Dayflow
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "14px" }}>
          Create your employee account to get started
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            background: "rgba(229, 72, 77, 0.1)",
            border: "1px solid var(--color-danger)",
            color: "var(--color-danger)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-btn)",
            fontSize: "14px",
            marginBottom: "1.25rem",
          }}
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.4rem", color: "var(--color-ink)" }}>
            Employee ID / Code *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. EMP-1082"
            value={formData.employeeCode}
            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-btn)",
              border: "1px solid var(--color-border)",
              fontSize: "14px",
              background: "#fff",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.4rem", color: "var(--color-ink)" }}>
              First Name *
            </label>
            <input
              type="text"
              required
              placeholder="Anita"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-btn)",
                border: "1px solid var(--color-border)",
                fontSize: "14px",
                background: "#fff",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.4rem", color: "var(--color-ink)" }}>
              Last Name *
            </label>
            <input
              type="text"
              required
              placeholder="Sharma"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-btn)",
                border: "1px solid var(--color-border)",
                fontSize: "14px",
                background: "#fff",
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.4rem", color: "var(--color-ink)" }}>
            Work Email *
          </label>
          <input
            type="email"
            required
            placeholder="you@organization.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-btn)",
              border: "1px solid var(--color-border)",
              fontSize: "14px",
              background: "#fff",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "0.4rem", color: "var(--color-ink)" }}>
            Password *
          </label>
          <input
            type="password"
            required
            placeholder="Min 8 chars (A-Z, a-z, 0-9, symbol)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-btn)",
              border: "1px solid var(--color-border)",
              fontSize: "14px",
              background: "#fff",
            }}
          />
          {formData.password.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ height: "4px", background: "var(--color-border)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: strength.width, background: strength.color, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: "12px", color: strength.color, display: "block", marginTop: "0.2rem", textAlign: "right" }}>
                Strength: {strength.label}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "0.2rem" }}>
          <input
            type="checkbox"
            id="terms"
            checked={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
            style={{ marginTop: "0.2rem", cursor: "pointer" }}
          />
          <label htmlFor="terms" style={{ fontSize: "13px", color: "var(--color-muted)", cursor: "pointer", lineHeight: 1.4 }}>
            I agree to the organization's HR Policy and Terms of Service.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-btn)",
            fontWeight: 600,
            fontSize: "15px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            marginTop: "0.5rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {isLoading ? "Creating Account..." : "Create Employee Account"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "14px", color: "var(--color-muted)" }}>
        Already have an account?{" "}
        <Link href="/sign-in" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
          Sign In
        </Link>
      </div>
    </div>
  );
}
