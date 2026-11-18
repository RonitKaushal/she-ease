import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select("+password");

        if (!user || !user.isActive) {
          throw new Error("Invalid email or password");
        }

        const valid = await user.comparePassword(credentials.password);
        if (!valid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          type: user.type,
          phone: user.phone || "",
        };
      },
    }),
    CredentialsProvider({
      id: "otp",
      name: "otp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "OTP", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          throw new Error("Phone and OTP are required");
        }

        await connectDB();
        const phone = credentials.phone.replace(/\D/g, "").slice(-10);
        if (phone.length !== 10) {
          throw new Error("Enter a valid 10-digit phone");
        }

        const otp = await Otp.findOne({
          phone,
          code: credentials.code,
          verified: false,
          expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!otp) {
          throw new Error("Invalid or expired OTP");
        }

        otp.verified = true;
        await otp.save();

        let user = await User.findOne({ phone: { $regex: phone } });
        if (!user) {
          user = await User.create({
            name: credentials.name || `User ${phone.slice(-4)}`,
            email: `phone.${phone}@sheease.local`,
            password: `otp-${phone}-${Date.now()}`,
            phone,
            type: "user",
            isVerified: true,
          });
        }

        if (!user.isActive) {
          throw new Error("Account deactivated");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          type: user.type,
          phone: user.phone || phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
