'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  username: string | null;
  setUsername: (username: string) => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);

  useEffect(() => {
    // Load username from localStorage on mount
    const savedUsername = localStorage.getItem('poll-username');
    if (savedUsername) {
      setUsernameState(savedUsername);
    }
  }, []);

  const setUsername = (newUsername: string) => {
    setUsernameState(newUsername);
    localStorage.setItem('poll-username', newUsername);
  };

  return (
    <UserContext.Provider value={{ 
      username, 
      setUsername, 
      isLoggedIn: !!username 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
