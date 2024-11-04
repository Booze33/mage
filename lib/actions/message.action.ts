'use server';

import { ID, Query } from "node-appwrite";
import { parseStringify } from "../utils";
import { createAdminClient } from "../appwrite";

const {
  NEXT_PUBLIC_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_MESSAGE_COLLECTION_ID: MESSAGE_COLLECTION_ID,
} = process.env;

interface Messages {
  $id: string;
  chat_id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  time_sent: number;
}

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

export async function getMessages(chatId: string): Promise<Messages[]> {
  try {
    if (!DATABASE_ID || !MESSAGE_COLLECTION_ID) {
      throw new Error('Database or collection ID is not defined');
    }

    const { database } = await createAdminClient();

    const response = await database.listDocuments(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      [Query.equal("chat_id", chatId)]
    );

    if (!response || !response.documents) {
      return [];
    }

    const sortedMessages = response.documents.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log(sortedMessages);

    return sortedMessages.map(message => ({
      $id: message.$id,
      chat_id: message.chat_id,
      content: message.content,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      time_sent: message.time_sent
    }));
  } catch (error) {
    console.error("Error retrieving messages:", error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch messages');
  }
};