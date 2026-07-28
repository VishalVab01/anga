import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { setAuthMethod, setAuthMode } from "@/lib/session";

export const Route = createFileRoute("/signup")({
  component: SignupRedirect,
});

function SignupRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    setAuthMethod("credentials");
    setAuthMode("signup");
    navigate({ to: "/role-selection", replace: true });
  }, [navigate]);

  return null;
}
