import { createFileRoute } from "@tanstack/react-router";
import { AuthFormPage } from "@/components/AuthFormPage";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Anga - Sign up" }] }),
  component: SignupScreen,
});

function SignupScreen() {
  return <AuthFormPage mode="signup" />;
}
