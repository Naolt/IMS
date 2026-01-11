'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, SignInRequest } from '@/types/api';
import { authApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { handleApiError } from '@/lib/api-client';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (data: SignInRequest) => Promise<void>;
    signOut: () => void;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user and token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedRefreshToken && storedUser && storedUser !== 'undefined') {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                // If parsing fails, clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        }

        setIsLoading(false);
    }, []);

    const signIn = async (data: SignInRequest) => {
        try {
            const response = await authApi.signIn(data);

            // Store token, refresh token, and user - Now accessing from response.data
            localStorage.setItem('token', response.data!.token);
            localStorage.setItem('refreshToken', response.data!.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data!.user));

            setToken(response.data!.token);
            setUser(response.data!.user);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    };

    const signOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                signIn,
                signOut,
                setUser: updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
