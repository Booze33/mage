'use server';

import { ID, Query } from "node-appwrite";
import { parseStringify } from "../utils";
import { createAdminClient } from "../appwrite";

const {
  NEXT_PUBLIC_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_MESSAGE_COLLECTION_ID: MESSAGE_COLLECTION_ID,
} = process.env;

export const sendMessage = async (messageData: Message) => {
  try {
    const { database } = await createAdminClient();
    const message = await database.createDocument(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      ID.unique(),
      {
        message_id: ID.unique(),
        ...messageData
      }
    );

    return parseStringify(message)
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export const getMessages = async (chatId: string) => {
  try {
    const { database } = await createAdminClient();
    const messages = await database.listDocuments(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      [Query.equal("chat_id", chatId)]
    );

    const sortMessages = messages.documents.sort((a, b) => a.timestamp - b.timestamp);

    console.log(sortMessages)
    return sortMessages;
  } catch (error) {
    console.error("Error retrieving messages:", error);
  }
};