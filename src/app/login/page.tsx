"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { upsertProfile } from "@/lib/auth/profile";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signUpSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

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
  const defaultSignUpValues = useMemo<SignUpValues>(
    () => ({ displayName: "", email: "", password: "" }),
    [],
  );

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

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: defaultSignUpValues,
    mode: "onSubmit",
  });

  const handleSignUp = signUpForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(credential.user, { displayName: values.displayName });

      // Default self-signups to participant role (staff accounts should be created/admin-assigned).
      await upsertProfile({
        uid: credential.user.uid,
        role: "participant",
        email: values.email,
        displayName: values.displayName,
      });

      const idToken = await credential.user.getIdToken();
      await handleSessionLogin(idToken);

      router.replace("/");
      router.refresh();
    } catch (err) {
      setErrorMessage(getFriendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>BridgePath</CardTitle>
          <CardDescription>Sign in or create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signIn">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signIn">Sign in</TabsTrigger>
              <TabsTrigger value="signUp">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signIn" className="mt-4">
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
                    placeholder="name@org.org"
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
              </form>
            </TabsContent>

            <TabsContent value="signUp" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    autoComplete="name"
                    aria-label="Name"
                    placeholder="Marcus Johnson"
                    {...signUpForm.register("displayName")}
                  />
                  {signUpForm.formState.errors.displayName?.message ? (
                    <p className="text-sm text-destructive" role="alert">
                      {signUpForm.formState.errors.displayName.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="signUpEmail" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="signUpEmail"
                    type="email"
                    autoComplete="email"
                    aria-label="Email"
                    placeholder="name@org.org"
                    {...signUpForm.register("email")}
                  />
                  {signUpForm.formState.errors.email?.message ? (
                    <p className="text-sm text-destructive" role="alert">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="signUpPassword" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="signUpPassword"
                    type="password"
                    autoComplete="new-password"
                    aria-label="Password"
                    placeholder="Minimum 8 characters"
                    {...signUpForm.register("password")}
                  />
                  {signUpForm.formState.errors.password?.message ? (
                    <p className="text-sm text-destructive" role="alert">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                {errorMessage ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

