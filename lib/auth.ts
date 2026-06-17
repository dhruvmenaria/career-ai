import { auth, currentUser } from "@clerk/nextjs/server";
import { hasClerkConfig, hasDatabaseConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type RequestUser = {
  clerkId: string;
  email: string;
  name?: string;
  dbUserId?: string;
};

export async function getRequestUser(): Promise<RequestUser | null> {
  if (!hasClerkConfig()) {
    return {
      clerkId: "local-demo-user",
      email: "demo@careerai.local",
      name: "Demo User"
    };
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress ?? `${userId}@careerai.local`;
    const name = user?.fullName ?? undefined;

    if (!hasDatabaseConfig()) {
      return { clerkId: userId, email, name };
    }

    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email, name },
      create: { clerkId: userId, email, name }
    });

    return { clerkId: userId, email, name, dbUserId: dbUser.id };
  } catch {
    return null;
  }
}
