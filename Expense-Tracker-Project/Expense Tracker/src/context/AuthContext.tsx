
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  currency: string;
};

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const DEMO_USER: User = {
  id: '1',
  name: 'Mike William',
  email: 'mike.william@example.com',
  currency: 'USD',
  profileImage: '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      
      setIsLoading(true);
      
      if (email && password.length >= 8) {
        const savedUser = localStorage.getItem('user');
        const user = savedUser 
          ? JSON.parse(savedUser) 
          : DEMO_USER;
        
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      
      setIsLoading(true);
      if (name && email && password.length >= 8) {
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          currency: 'USD',
          profileImage: '',
        };
        setCurrentUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        navigate('/dashboard');
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
