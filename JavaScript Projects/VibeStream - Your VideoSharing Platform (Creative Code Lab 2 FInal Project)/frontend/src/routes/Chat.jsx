/**
 * Chat component overview:
 * 1. Retrieves the authenticated user's ID by decoding the JWT stored in localStorage.
 * 2. Fetches a list of other users available for chatting and displays them in a sidebar with avatars.
 * 3. When a user is selected, loads the conversation history between the current user and the selected user.
 * 4. Renders chat messages with proper alignment, avatars, and timestamps, distinguishing sent and received messages.
 * 5. Provides a message input field and send button to post new messages, updating the chat in real time.
 */

// frontend/src/routes/Chat.jsx
import React, { useState, useEffect, useContext } from 'react';
import api                from '../services/api';
import TitleNav           from '../components/TitleNav';
import { AuthContext }    from '../context/AuthContext';

export default function Chat() {
    const { user } = useContext(AuthContext);
    const [users, setUsers]           = useState([]);
    const [selectedUser, setSelected] = useState(null);
    const [messages, setMessages]     = useState([]);
    const [input, setInput]           = useState('');

    // Decode current user ID from JWT
    const token = localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserId = payload.id;
        } catch {
            currentUserId = null;
        }
    }

    // Fetch list of chat-able users
    useEffect(() => {
        api.get('/messages/users')
            .then(res => setUsers(res.data))
            .catch(console.error);
    }, []);

    // Fetch conversation when a user is selected
    useEffect(() => {
        if (!selectedUser) return;
        api.get(`/messages/${selectedUser.id}`)
            .then(res => setMessages(res.data))
            .catch(console.error);
    }, [selectedUser]);

    // Send a new message
    const handleSend = async e => {
        e.preventDefault();
        if (!input.trim() || !selectedUser) return;
        try {
            const res = await api.post(
                `/messages/${selectedUser.id}`,
                { content: input }
            );
            setMessages(msgs => [...msgs, res.data]);
            setInput('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <TitleNav title="Chat" />
            <div className="chat-container" style={{ display: 'flex', height: '80vh' }}>
                {/* Left panel: user list with pictures */}
                <div style={{
                    width: '25%',
                    borderRight: '1px solid #ccc',
                    padding: '1rem',
                    overflowY: 'auto'
                }}>
                    <h3>Users</h3>
                    {users.map(u => (
                        <button
                            key={u.id}
                            onClick={() => setSelected(u)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '0.5rem',
                                marginBottom: '0.25rem',
                                background: selectedUser?.id === u.id ? '#ddd' : '#fff',
                                border: '1px solid #ccc',
                                textAlign: 'left'
                            }}
                        >
                            {u.picture && (
                                <img
                                    src={`/uploads/${u.picture}`}
                                    alt={`${u.username}'s avatar`}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginRight: '0.5rem'
                                    }}
                                />
                            )}
                            {u.username}
                        </button>
                    ))}
                </div>

                {/* Right panel: chat window */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedUser ? (
                        <>
                            <div style={{
                                padding: '1rem',
                                borderBottom: '1px solid #ccc',
                                color: '#3F44D1'
                            }}>
                                <h3>Chat with {selectedUser.username}</h3>
                            </div>

                            <div style={{
                                flex: 1,
                                padding: '1rem',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {messages.map(m => {
                                    const isMe = m.sender_id === currentUserId;
                                    const avatarSrc = isMe
                                        ? user.picture && `/uploads/${user.picture}`
                                        : selectedUser.picture && `/uploads/${selectedUser.picture}`;
                                    return (
                                        <div
                                            key={m.messages_id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                                                alignItems: 'flex-end',
                                                marginBottom: '0.75rem'
                                            }}
                                        >
                                            {/* received */
                                                !isMe && avatarSrc && (
                                                    <img
                                                        src={avatarSrc}
                                                        alt=""
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover',
                                                            marginRight: '0.5rem'
                                                        }}
                                                    />
                                                )}

                                            <div style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '16px',
                                                background: isMe ? '#3F44D1' : '#eee',
                                                color: isMe ? '#fff' : '#000',
                                                maxWidth: '60%',
                                                wordBreak: 'break-word'
                                            }}>
                                                {m.content}
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    marginTop: '0.25rem',
                                                    textAlign: 'right'
                                                }}>
                                                    {new Date(m.sent_at).toLocaleTimeString()}
                                                </div>
                                            </div>

                                            {/* sent */}
                                            {isMe && avatarSrc && (
                                                <img
                                                    src={avatarSrc}
                                                    alt=""
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        marginLeft: '0.5rem'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <form
                                onSubmit={handleSend}
                                style={{
                                    display: 'flex',
                                    borderTop: '1px solid #ccc',
                                    padding: '0.5rem'
                                }}
                            >
                                <input
                                    style={{ flex: 1, padding: '0.5rem' }}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message…"
                                />
                                <button
                                    type="submit"
                                    style={{
                                        marginLeft: '0.5rem',
                                        background: 'none',
                                        border: 'none',
                                        color: '#3F44D1',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    &rarr;
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <p>Select a user to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
