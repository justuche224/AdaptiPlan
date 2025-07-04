import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  redirect: {
    signOut: "/sign-in",
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: false,
    }
  }
});
