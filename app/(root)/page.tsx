'use client'

// import { getUserInfo, getProfilePic, getLoggedInUser } from "@/lib/actions/user.action";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getChats } from '@/lib/actions/chat.action';

export default function Home() {
  // const [user, setUser] = useState(null);
  // const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const loggedUser = await getLoggedInUser();

  //       if (!loggedUser) throw new Error('No logged-in user found');

  //       const userData = await getUserInfo({ userid: loggedUser.user_id });

  //       if (userData) {
  //         setUser(userData);

  //         const profilePicId = userData.profile_pic_id;
  //         if (profilePicId) {
  //           const profilePic = await getProfilePic(profilePicId);
  //           setProfilePicUrl(profilePic);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch logged-in user:', error);
  //     }
  //   };

  //   fetchUser();
  // }, [user]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true)
        const fetchedChats = await getChats();
        if(Array.isArray(fetchedChats)) {
          setChats(fetchedChats);
        } else {
          console.error('Fetched chats is not an array:', fetchedChats);
          setChats([]);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
      setLoading(false)
    };

    fetchChats();
  }, []);


  return (
    <div className="w-[100vw] h-[100vh] bg-[#091057]">
      {/* {profilePicUrl ? (
        <Image src={profilePicUrl} width={100} height={100} alt="profile pic" />
      ) : (
        <p>Loading profile picture...</p>
      )} */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          {chats.map((chat: Chat) => (
            <Link href={`/chat/${chat.chat_id}`} key={chat.chat_id}>
              <h1>{chat.title}</h1>
            </Link>
          ))}
        </div>
      )}
      <Link href='/start'>Chat</Link>
    </div>
  );
}
