/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../../lib/utils";
import { createAdminClient, createSessionClient } from "../appwrite";

const {
  NEXT_PUBLIC_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
  NEXT_PUBLIC_USER_COLLECTION_ID: USER_COLLECTION_ID,
} = process.env;

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  profile_pic: File | null;
}

interface SignInParams {
  email: string;
  password: string;
}

interface getUserInfoProps {
  userid: string,
}

export const getUserInfo = async ({ userid }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('user_id', [userid])]
    )

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    const user = await getUserInfo({ userid: session.userId })

    return parseStringify(user);
  } catch (error) {
    console.error('Error occured when siging in:', error);
  }
};

export const register = async ({ password, ...userData }: SignUpParams) => {
  const { email, name, profile_pic } = userData;

  let newUserAccount;

  try {
    
    const { account, database, storage } = await createAdminClient();
    newUserAccount = await account.create(ID.unique(), email, password, name);

    if (!newUserAccount) throw new Error('Error creating user');

    let profilePicFileId = null;
    if (profile_pic) {
      const profilePicFile = storage.createFile(
        BUCKET_ID!,
        ID.unique(),
        profile_pic,
      );
      profilePicFileId = (await profilePicFile).$id;
      console.log('ProfilePicFileId:', profilePicFileId)
    }

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        user_id: newUserAccount.$id,
        name: newUserAccount.name,
        full_name: 'Tisloh Tebe',
        email: newUserAccount.email,
        profile_pic_id: profilePicFileId,
      }
    );

    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error('Error during user registration:', error);
  }
};

export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userid: result.$id})

    return parseStringify(user);
  } catch (error) {
    console.log(error)
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    (await cookies()).delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}

function timeoutPromise(ms: number) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms));
}

export const getProfilePic = async (fileId: string) => {
  try {
    const { storage } = await createAdminClient();
    const result = await storage.getFilePreview(BUCKET_ID!, fileId);

    const buffer = result instanceof ArrayBuffer ? result : new ArrayBuffer(0);
    if (buffer.byteLength === 0) throw new Error("Failed to fetch profile picture buffer");

    const base64String = Buffer.from(buffer).toString('base64');

    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error("Error fetching profile picture:", error);
  }
};

export const getUsers = async () => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
    )

    const users = {
      documents: [
        ...user.documents
      ]
    }

    return parseStringify(users.documents);
  } catch (error) {
    console.log(error)
  }
}