import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user,  setUser ] = useState({
        username: localStorage.getItem('username') || '',
        role:     localStorage.getItem('role')     || 'normal'
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('username', user.username);
            localStorage.setItem('role', user.role);
        } else {
            localStorage.clear();
        }
    }, [token, user]);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        setToken(res.data.token);
        setUser({ username: res.data.username, role: res.data.role });
    };

    const register = async (username, password) => {
        await api.post('/auth/register', { username, password });
    };

    const logout = () => {
        setToken('');
        setUser({ username: '', role: 'normal' });
    };

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
