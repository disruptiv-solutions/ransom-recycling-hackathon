"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getFirebaseAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type SignInValues = z.infer<typeof signInSchema>;

const getFriendlyAuthError = (err: unknown) => {
  if (err instanceof FirebaseError) {
    const code = err.code ?? "auth/unknown";
    if (code === "auth/invalid-api-key") {
      return "Firebase config error: invalid API key. Check NEXT_PUBLIC_FIREBASE_API_KEY.";
    }
    if (code === "auth/operation-not-allowed") {
      return "Email/password sign-in is disabled in Firebase. Enable it in Firebase Auth providers.";
    }
    if (code === "auth/email-already-in-use") {
      return "That email is already in use. Try signing in instead.";
    }
    if (code === "auth/weak-password") {
      return "Password is too weak. Use at least 8 characters.";
    }
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      return "Invalid email or password.";
    }
    if (code === "auth/user-not-found") {
      return "No account found for that email. Create an account first.";
    }
    if (code === "auth/network-request-failed") {
      return "Network error talking to Firebase. Check your connection and try again.";
    }
    return `Firebase auth error (${code}).`;
  }

  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
};

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultSignInValues = useMemo<SignInValues>(() => ({ email: "", password: "" }), []);
  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: defaultSignInValues,
    mode: "onSubmit",
  });

  const handleSessionLogin = async (idToken: string) => {
    const res = await fetch("/api/auth/sessionLogin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("SESSION_LOGIN_FAILED");
  };

  const handleSignIn = signInForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const idToken = await credential.user.getIdToken();

      await handleSessionLogin(idToken);

      const whoami = await fetch("/api/auth/whoami", { method: "GET" });
      if (whoami.status === 409) {
        await fetch("/api/auth/sessionLogout", { method: "POST" });
        setErrorMessage("Your account needs to be provisioned. Please contact an administrator.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setErrorMessage(getFriendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Ransom Recycling Operations</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="signInEmail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="signInEmail"
                type="email"
                autoComplete="email"
                aria-label="Email"
                placeholder="name@ransom.org"
                {...signInForm.register("email")}
              />
              {signInForm.formState.errors.email?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {signInForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="signInPassword" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="signInPassword"
                type="password"
                autoComplete="current-password"
                aria-label="Password"
                placeholder="••••••••"
                {...signInForm.register("password")}
              />
              {signInForm.formState.errors.password?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {signInForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <button
              type="button"
              className="w-full text-sm font-medium text-slate-500 hover:text-slate-700"
              aria-label="Forgot password"
            >
              Forgot password?
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

