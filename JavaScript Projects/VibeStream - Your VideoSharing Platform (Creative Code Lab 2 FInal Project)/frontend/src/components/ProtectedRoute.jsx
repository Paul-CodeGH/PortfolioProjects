import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// ProtectedRoute component that checks if the user is authenticated
export default function ProtectedRoute({ children }) {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/" replace />;
}