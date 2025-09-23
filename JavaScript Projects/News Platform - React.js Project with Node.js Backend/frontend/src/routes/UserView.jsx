// frontend/src/routes/UserView.jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function UserView() {
    const { user } = useContext(AuthContext);

    return (
        <div className="profile-container">
            <div className="profile-box">
                <h2>Your Profile</h2>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>
        </div>
    );
}
