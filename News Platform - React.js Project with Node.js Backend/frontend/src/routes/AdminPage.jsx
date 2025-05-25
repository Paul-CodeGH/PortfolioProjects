import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function AdminPage() {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/admin/users').then(res => {
            const others = res.data.filter(u => u.username !== user.username);
            setUsers(others);
        });
    }, [user.username]);

    const handleRoleChange = (id, newRole) => {
        api.put(`/admin/users/${id}/role`, { role: newRole })
            .then(() => {
                setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            })
            .catch(err => alert(err.response?.data?.error || 'Failed to update'));
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this user?')) return;
        api.delete(`/admin/users/${id}`)
            .then(() => {
                setUsers(users.filter(u => u.id !== id));
            })
            .catch(err => alert(err.response?.data?.error || 'Failed to delete'));
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <table>
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Change to…</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {users.map(u => (
                    <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.role}</td>
                        <td>
                            <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                            >
                                <option value="normal">normal</option>
                                <option value="creator">creator</option>
                            </select>
                        </td>
                        <td>
                            <button onClick={() => handleDelete(u.id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
