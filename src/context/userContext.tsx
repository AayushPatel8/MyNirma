'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

type UserContextType = {
  user: any;
  setUser: (user: any) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});


export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/get-user');
        setUser(response.data.user || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
    
  }, []);

  return (
    <UserContext.Provider value={{user,setUser}}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
