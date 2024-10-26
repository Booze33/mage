"use server";

import { Databases, Users, Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

let sessionClient: Client | null = null;
let adminClient: Client | null = null;

async function createSessionClient() {
  if (!sessionClient) {
    sessionClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!);
  }

  const session = (await cookies()).get("appwrite-session");

  if (!session || !session.value) {
    throw new Error("No session");
  }

  sessionClient.setSession(session.value);

  return {
    get account() {
      return new Account(sessionClient!);
    },
  };
}

async function createAdminClient() {
  if (!adminClient) {
    adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!)
      .setKey(process.env.NEXT_PUBLIC_API_KEY!);
  }

  return {
    get account() {
      return new Account(adminClient!);
    },
    get database() {
      return new Databases(adminClient!);
    },
    get user() {
      return new Users(adminClient!);
    },
  };
}

export { createSessionClient, createAdminClient };