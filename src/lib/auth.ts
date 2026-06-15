import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            company: { select: { id: true, name: true } },
            admin: { select: { id: true, name: true } },
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name:
            user.student
              ? `${user.student.firstName} ${user.student.lastName}`
              : user.company?.name ?? user.admin?.name ?? user.email,
          profileId:
            user.student?.id ?? user.company?.id ?? user.admin?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
        token.profileId = (user as unknown as { profileId: string | null }).profileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.sub ?? "";
        (session.user as { role: string }).role = token.role as string;
        (session.user as { profileId: string | null }).profileId = token.profileId as string | null;
      }
      return session;
    },
  },
};
