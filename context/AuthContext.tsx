import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';

// Define types
type AuthContextType = {
  authUser: User | null;
  authLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  authLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
