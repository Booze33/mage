'use client'

import { useRouter } from 'next/navigation';
import { getUsers, getLoggedInUser } from "@/lib/actions/user.action";
import { createChat } from "@/lib/actions/chat.action";
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const fetchedUsers = await getUsers();
        if(Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers);
        } else {
          console.error('Fetched users is not an array:', fetchedUsers);
          setUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
      setLoading(false)
    };

    fetchUsers();
  }, []);

  const handleClick = async (otherUserId: string, chatTitle: string) => {
    try {
      const currentUser = await getLoggedInUser();
      const userId = currentUser.user_id;

      const chat = await createChat(userId, otherUserId, chatTitle);

      if (chat) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  }

  return (
    <div className="w-[100vw] h-[100vh] bg-[#091057]">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          {users.map((user: User) => (
            <button type="button" key={user.user_id} onClick={() => handleClick(user.user_id, user.name)}>
              <h1>{user.name}</h1>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
