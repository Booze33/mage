/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { sendMessage, getMessages } from "@/lib/actions/message.action";
import { getChat } from '@/lib/actions/chat.action';
import { Client } from "appwrite";

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: ENDPOINT,
  NEXT_PUBLIC_PROJECT_ID: PROJECT_ID,
  NEXT_PUBLIC_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_MESSAGE_COLLECTION_ID: MESSAGE_COLLECTION_ID,
} = process.env;

const ChatPage = ({ params: { chat_id } }: ChatPageProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<MessageProps[]>([])
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);

  const client = new Client()
    .setEndpoint(ENDPOINT!)
    .setProject(PROJECT_ID!);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true)
        const fetchedChat = await getChat(chat_id);

        if (Array.isArray(fetchedChat) && fetchedChat.length > 0) {
          setChat(fetchedChat[0]);
        } else {
          console.error('Chat not found');
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
      setLoading(false)
    };

    fetchChat();
  }, [chat_id]);

  useEffect(() => {
    const fetchMessages = async () => {
      const chatMessages = await getMessages(chat_id);
      setMessages(chatMessages);
    };

    fetchMessages();
  }, [chat_id]);

  useEffect(() => {
    const unsubscribe = client.subscribe(
      [`databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION_ID}.documents`],
      (response: any) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create') &&
            response.payload.chat_id === chat_id) {
          setMessages((prevMessages) => [...prevMessages, response.payload]);
        }
      }
    );

    return () => unsubscribe();
  }, [chat_id, client]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    const messageData = {
      chat_id: chat_id,
      sender_id: chat.user1_id,
      receiver_id: chat.user2_id,
      content: newMessage,
      time_sent: new Date()
    }

    try {
      await sendMessage(messageData);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.message_id}>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
      )}
      <div className="send-message">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  )
}

export default ChatPage;