import { createFileRoute } from "@tanstack/react-router";
import { AuthFormPage } from "@/components/AuthFormPage";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Anga - Log in" }] }),
  component: LoginScreen,
});

function LoginScreen() {
  return <AuthFormPage mode="login" />;
}
