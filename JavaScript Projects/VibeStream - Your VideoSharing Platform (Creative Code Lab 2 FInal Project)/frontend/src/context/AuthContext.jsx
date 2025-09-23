// AuthContext.jsx
//
// This file creates a React context that:
// 1. Loads any saved auth token and user info from localStorage when the app starts.
// 2. Keeps localStorage in sync whenever the token or user data changes.
// 3. Verifies the token is still valid by pinging a protected endpoint on mount.
// 4. Exposes easy-to-use login, register, logout, updatePicture, and updateRole functions
//    so any component can update auth state and have those changes persist automatically.


import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser]   = useState({
        username: localStorage.getItem('username') || '',
        role:     localStorage.getItem('role')     || 'normal',
        picture:  localStorage.getItem('picture')  || ''
    });

    // Persist to localStorage whenever token or user changes
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('username', user.username);
            localStorage.setItem('role',     user.role);
            localStorage.setItem('picture',  user.picture);
        } else {
            localStorage.clear();
        }
    }, [token, user]);

    // On mount, verify token still works
    useEffect(() => {
        if (token) {
            api.get('/protected')
                .catch(() => {
                    setToken('');
                    setUser({ username: '', role: 'normal', picture: '' });
                });
        }
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        setToken(res.data.token);
        setUser({
            username: res.data.username,
            role:     res.data.role,
            picture:  res.data.picture
        });
    };

    const register = async (username, password, email) => {
        return api.post('/auth/register', { username, password, email });
    };

    const logout = () => {
        setToken('');
        setUser({ username: '', role: 'normal', picture: '' });
    };

    const updatePicture = newFilename => {
        setUser(u => ({ ...u, picture: newFilename }));
    };

    // ← NEW: allow updating just the role in context
    const updateRole = newRole => {
        setUser(u => ({ ...u, role: newRole }));
    };

    return (
        <AuthContext.Provider value={{
            token,
            user,
            login,
            register,
            logout,
            updatePicture,
            updateRole    // exposed for AdminPage to call
        }}>
            {children}
        </AuthContext.Provider>
    );
}
