'use server';

import { ID, Query } from "node-appwrite";
import { parseStringify } from "../utils";
import { createAdminClient } from "../appwrite";

const {
  NEXT_PUBLIC_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_CHAT_COLLECTION_ID: CHAT_COLLECTION_ID,
} = process.env;

export const createChat = async (user1: string, user2: string, title: string) => {
  try {
    const { database } = await createAdminClient();
    const chat = await database.createDocument(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
      ID.unique(),
      {
        chat_id: ID.unique(),
        user1_id: user1,
        user2_id: user2,
        created_at: new Date(),
        title: title
      }
    );

    return parseStringify(chat)
  } catch (error) {
    console.error(error);
  }
}

export const getChats = async () => {
  try {
    const { database } = await createAdminClient();
    const chat = await database.listDocuments(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
    );

    const chats = {
      documents: [
        ...chat.documents
      ]
    }

    return parseStringify(chats.documents)
  } catch (error) {
    console.error(error);
  }
}

export const getChat = async (chatId: string) => {
  try {
    const { database } = await createAdminClient();
    console.log('*******', chatId)
    const chat = await database.listDocuments(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
      [Query.equal('chat_id', [chatId])]
    );

    return parseStringify(chat.documents)
  } catch (error) {
    console.error("Error fetching chat:", error);
  }
}