'use client'

import { getUserInfo, getProfilePic, getLoggedInUser } from "@/lib/actions/user.action";
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const loggedUser = await getLoggedInUser();

        if (!loggedUser) throw new Error('No logged-in user found');

        const userData = await getUserInfo({ userid: loggedUser.user_id });

        if (userData) {
          setUser(userData);

          const profilePicId = userData.profile_pic_id;
          if (profilePicId) {
            const profilePic = await getProfilePic(profilePicId);
            setProfilePicUrl(profilePic);
          }
        }
      } catch (error) {
        console.error('Failed to fetch logged-in user:', error);
      }
    };

    fetchUser();
  }, [user]);

  return (
    <div className="">
      {profilePicUrl ? (
        <Image src={profilePicUrl} width={100} height={100} alt="profile pic" />
      ) : (
        <p>Loading profile picture...</p>
      )}
    </div>
  );
}
