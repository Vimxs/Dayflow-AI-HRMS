import { SignUpForm } from "@/components/forms/SignUpForm";

export const metadata = {
  title: "Sign Up",
  description: "Create an account on Dayflow HRMS",
};

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <SignUpForm />
    </main>
  );
}
