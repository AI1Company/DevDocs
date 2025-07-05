import { StackServerApp } from "@stackframe/stack";

// Check for required environment variables
const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
const secretKey = process.env.STACK_SECRET_SERVER_KEY;

if (!projectId || !publishableKey || !secretKey) {
  console.warn(
    "Stack Auth environment variables not configured. Authentication will not work properly.",
  );
}

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    home: "/",
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    emailVerification: "/handler/email-verification",
    passwordReset: "/handler/password-reset",
    accountSettings: "/handler/account-settings",
  },
});
