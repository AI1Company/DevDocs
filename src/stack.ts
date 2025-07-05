import { StackServerApp } from "@stackframe/stack";

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
