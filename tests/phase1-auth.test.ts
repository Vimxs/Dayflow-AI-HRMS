/* eslint-disable no-console */
/**
 * Automated Verification Script for Phase 1 (Authentication & Authorization)
 * Tests T1.1 through T1.7 against the live endpoints and database.
 */

async function runTests() {
  const BASE_URL = "http://localhost:3000";
  console.log("=================================================");
  console.log("  Running Phase 1 (T1.1 - T1.7) Test Suite");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // --- Test 1: Sign-in with Seeded Admin (T1.4) ---
  console.log("--- 1. Testing Admin Sign-in (T1.4) ---");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@dayflow.com",
      password: "Admin@123",
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookies = adminLoginRes.headers.get("set-cookie") || "";

  assert(adminLoginRes.status === 200, "Admin login status is 200");
  assert(adminLoginData.success === true, "Admin login success flag is true");
  assert(adminLoginData.data.user.role === "ADMIN", "Admin role is returned correctly");
  assert(adminLoginData.data.redirectTo === "/admin/dashboard", "Admin redirect is /admin/dashboard");
  assert(adminCookies.includes("dayflow_access_token"), "Access token cookie is set");
  assert(adminCookies.includes("dayflow_refresh_token"), "Refresh token cookie is set");

  // Extract cookies for subsequent requests
  const extractCookie = (name: string, cookieHeader: string) => {
    const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : "";
  };

  const adminAccessToken = extractCookie("dayflow_access_token", adminCookies);
  const adminRefreshToken = extractCookie("dayflow_refresh_token", adminCookies);
  const cookieHeader = `dayflow_access_token=${adminAccessToken}; dayflow_refresh_token=${adminRefreshToken}`;

  // --- Test 2: Authenticated /api/auth/me (T1.4, T1.5) ---
  console.log("\n--- 2. Testing /api/auth/me (T1.4, T1.5) ---");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const meData = await meRes.json();

  assert(meRes.status === 200, "/api/auth/me status is 200 with valid cookie");
  assert(meData.data.user.email === "admin@dayflow.com", "Me endpoint returns admin email");
  assert(meData.data.user.employee.employeeCode === "EMP001", "Me endpoint returns employee record");

  // --- Test 3: Unauthenticated /api/auth/me blocked ---
  const unauthMeRes = await fetch(`${BASE_URL}/api/auth/me`);
  assert(unauthMeRes.status === 401, "/api/auth/me blocks unauthenticated requests with 401");

  // --- Test 4: Password Strength & Validation Rules (T1.2) ---
  console.log("\n--- 4. Testing Password Strength & Validation Rules (T1.2) ---");
  const weakPasswordRes = await fetch(`${BASE_URL}/api/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeCode: "TEST999",
      name: "Test User",
      email: "testuser@dayflow.com",
      password: "weak", // Fails min length, numbers, special chars
      role: "EMPLOYEE",
      department: "Engineering",
      jobTitle: "Tester",
    }),
  });
  const weakData = await weakPasswordRes.json();
  assert(weakPasswordRes.status === 400, "Weak password rejected with 400");
  assert(weakData.success === false, "Weak password error returned");

  // --- Test 5: Sign-up with Verification Email Trigger (T1.1, T1.3) ---
  console.log("\n--- 5. Testing Sign-up & Verification Token Generation (T1.1, T1.3) ---");
  const testEmail = `newemployee_${Date.now()}@dayflow.com`;
  const testCode = `EMP${Math.floor(1000 + Math.random() * 9000)}`;

  const signUpRes = await fetch(`${BASE_URL}/api/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeCode: testCode,
      name: "Test Employee",
      email: testEmail,
      password: "Password@123",
      role: "EMPLOYEE",
      department: "Engineering",
      jobTitle: "Software Developer",
    }),
  });
  const signUpData = await signUpRes.json();

  assert(signUpRes.status === 201, "Sign-up returns 201 Created");
  assert(signUpData.success === true, "Sign-up success flag is true");
  assert(!!signUpData.data.verificationUrl, "Verification link generated");

  // Extract token from verificationUrl
  const verifyTokenMatch = signUpData.data.verificationUrl.match(/token=([^&]+)/);
  const verifyToken = verifyTokenMatch ? decodeURIComponent(verifyTokenMatch[1]) : "";
  assert(!!verifyToken, "Verification token extracted");

  // --- Test 6: Unverified User Sign-in Blocked (T1.3) ---
  console.log("\n--- 6. Testing Unverified User Login Protection (T1.3) ---");
  const unverifiedLoginRes = await fetch(`${BASE_URL}/api/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "Password@123",
    }),
  });
  const unverifiedData = await unverifiedLoginRes.json();

  assert(unverifiedLoginRes.status === 403, "Unverified login returns 403 Forbidden");
  assert(unverifiedData.needsVerification === true, "needsVerification flag is true");

  // --- Test 7: Email Verification Execution (T1.3) ---
  console.log("\n--- 7. Testing Email Verification API (T1.3) ---");
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: verifyToken }),
  });
  const verifyData = await verifyRes.json();

  assert(verifyRes.status === 200, "Email verification returns 200 OK");
  assert(verifyData.success === true, "Account successfully verified");

  // Try using the same token again (should fail)
  const reuseVerifyRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: verifyToken }),
  });
  assert(reuseVerifyRes.status === 400, "Reusing used token is rejected with 400");

  // --- Test 8: Verified User Login (T1.4) ---
  console.log("\n--- 8. Testing Verified User Sign-in (T1.4) ---");
  const verifiedLoginRes = await fetch(`${BASE_URL}/api/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "Password@123",
    }),
  });
  const verifiedLoginData = await verifiedLoginRes.json();

  assert(verifiedLoginRes.status === 200, "Verified user signs in with 200");
  assert(verifiedLoginData.data.user.role === "EMPLOYEE", "User role is EMPLOYEE");
  assert(verifiedLoginData.data.redirectTo === "/employee/dashboard", "Redirect is /employee/dashboard");

  // --- Test 9: Forgot Password & Reset Flow (T1.6) ---
  console.log("\n--- 9. Testing Forgot Password & Reset Flow (T1.6) ---");
  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const forgotData = await forgotRes.json();

  assert(forgotRes.status === 200, "Forgot password returns 200");
  assert(!!forgotData.resetUrl, "Password reset token URL generated");

  const resetTokenMatch = forgotData.resetUrl.match(/token=([^&]+)/);
  const resetToken = resetTokenMatch ? decodeURIComponent(resetTokenMatch[1]) : "";

  // Reset password
  const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: resetToken,
      password: "NewPassword@456",
    }),
  });
  const resetData = await resetRes.json();

  assert(resetRes.status === 200, "Password reset returns 200");
  assert(resetData.success === true, "Password successfully reset");

  // Sign in with new password
  const newLoginRes = await fetch(`${BASE_URL}/api/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "NewPassword@456",
    }),
  });
  assert(newLoginRes.status === 200, "Sign in with new password succeeds");

  // Sign in with old password (must fail)
  const oldLoginRes = await fetch(`${BASE_URL}/api/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "Password@123",
    }),
  });
  assert(oldLoginRes.status === 401, "Sign in with old password fails with 401");

  // --- Test 10: Logout API (T1.7) ---
  console.log("\n--- 10. Testing Logout API (T1.7) ---");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });
  const logoutCookies = logoutRes.headers.get("set-cookie") || "";

  assert(logoutRes.status === 200, "Logout returns 200");
  assert(logoutCookies.includes("Max-Age=0"), "Cookies cleared with Max-Age=0 on logout");

  console.log("\n=================================================");
  console.log(`  Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
