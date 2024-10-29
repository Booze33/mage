'use client';

import { useState, useEffect } from 'react';
import { sendMessage } from "@/lib/actions/message.action";
import { getChat } from '@/lib/actions/chat.action';

const ChatPage = ({ params: { chat_id } }: ChatPageProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true)
        const fetchedChat = await getChat(chat_id);
        console.log(fetchedChat)

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
  console.log(chat)

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
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="send-message">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  )
}

export default ChatPage;