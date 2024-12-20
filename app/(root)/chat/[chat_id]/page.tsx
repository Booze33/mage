'use client';

import { use, useState, useEffect } from 'react';
import { sendMessage, getMessages } from "@/lib/actions/message.action";
import { getChat } from '@/lib/actions/chat.action';
import { client } from "@/lib/clientSide";
import { getLoggedInUser } from '@/lib/actions/user.action';

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;
const MESSAGE_COLLECTION_ID = process.env.NEXT_PUBLIC_MESSAGE_COLLECTION_ID;

const ChatPage = ({ params }: { params: Promise<{ chat_id: string }> }) => {
  const { chat_id } = use(params);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedChat = await getChat(chat_id);

        if (Array.isArray(fetchedChat) && fetchedChat.length > 0) {
          setChat(fetchedChat[0]);
        } else {
          setError('Chat not found');
          console.error('Chat not found');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch chat');
        console.error('Failed to fetch chat:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchChat();
  }, [chat_id]);

  useEffect(() => {
    const fetchMessages = async () => {
      const currentUser = await getLoggedInUser();
      setUserId(currentUser.user_id)
        // userId = currentUser.user_id;

      console.log('test', userId)

      try {
        setError(null);
        const chatMessages = await getMessages(chat_id);

        if (Array.isArray(chatMessages)) {
          setMessages(chatMessages);
        } else {
          throw new Error('Invalid messages format received');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error fetching messages');
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chat_id]);

  useEffect(() => {
    if (!DATABASE_ID || !MESSAGE_COLLECTION_ID) {
      console.error('Missing required environment variables');
      return;
    }

    const channel = `databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION_ID}.documents`;
    let unsubscribe: (() => void) | null = null;

    console.log('client:', client)

    const setupRealtimeSubscription = async () => {
      try {
        if (!client) {
          console.error('Appwrite client is not initialized');
          return;
        }
    
        console.log('Setting up realtime subscription for channel:', channel);
  
        unsubscribe = client.subscribe(channel, (response) => {
          console.log('Received realtime event:', response);

          try {
            if (!response?.events?.[0]) {
              console.log('No events in response:', response);
              return;
            }

            const eventType = response.events[0];

            if (eventType.includes('create')) {
              const newMessage = response.payload as MessageProps;;
              setMessages((prevMessages) => [...prevMessages, newMessage]);
              console.log(messages)
              console.log('Realtime subscription setup completed');
            }
          } catch (error) {
            console.error('Error in real-time subscription:', error);
          }
        });
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        setError(error instanceof Error ? error.message : 'Error setting up realtime connection');
      }
    }

    setupRealtimeSubscription();
    console.log('unsubscribe', unsubscribe)

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up realtime subscription');
        unsubscribe();
      }
    };
  }, [chat_id]);

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

  if (error) {
    return <div className="error-message p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.message_id}>
              {msg.sender_id === userId ? (
                <div className="p-3 rounded-lg max-w-[80%] ml-auto bg-blue-500 text-white">
                  <p>{msg.content}</p>
                    <span className="text-xs opacity-75">
                    {new Date(msg.time_sent).toLocaleTimeString()}
                    </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg max-w-[80%] bg-gray-200">
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-75">
                  {new Date(msg.time_sent).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message"
          className="flex-1 p-2 border rounded-lg"
        />
        <button 
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
