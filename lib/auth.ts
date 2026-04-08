import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const sql = getDb();
      await sql`
        INSERT INTO users (email, name)
        VALUES (${user.email!}, ${user.name!})
        ON CONFLICT (email) DO UPDATE SET name = ${user.name!}
      `;
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const sql = getDb();
        const rows = await sql`
          SELECT id FROM users WHERE email = ${session.user.email}
        `;
        if (rows.length > 0) {
          (session as any).userId = rows[0].id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getAuthenticatedUserId(): Promise<string | null> {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  return (session as any)?.userId ?? null;
}
