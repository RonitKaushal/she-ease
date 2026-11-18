import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      type: "user" | "professional" | "admin";
      phone?: string;
    };
  }

  interface User {
    id: string;
    type: "user" | "professional" | "admin";
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    type: "user" | "professional" | "admin";
    phone?: string;
  }
}
