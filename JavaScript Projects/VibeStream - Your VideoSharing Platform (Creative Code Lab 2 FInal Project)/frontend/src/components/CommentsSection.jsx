// frontend/src/components/CommentsSection.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Comment section component for displaying and adding comments to a video
export default function CommentsSection({ videoId }) {
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState('');

    // Fetch comments when the component mounts or videoId changes
    useEffect(() => {
        api.get(`/videos/${videoId}/comments`)
            .then(res => setComments(res.data))
            .catch(console.error);
    }, [videoId]);

    // Handle form submission to add a new comment
    const handleSubmit = async e => {
        e.preventDefault();
        if (!input.trim()) return;
        try {
            const res = await api.post(`/videos/${videoId}/comments`, { content: input });
            setComments(comments => [...comments, res.data]);
            setInput('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <h4>Comments</h4>

            {/* Move the form above the list of comments */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
                <input
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        marginBottom: '0.5rem'
                    }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Add a comment..."
                />
                <button type="submit">Post Comment</button>
            </form>

            <div>
                {comments.map(c => (
                    <div
                        key={c.comment_id}
                        style={{ display: 'flex', marginBottom: '1rem' }}
                    >
                        {c.picture && (
                            <img
                                src={`/uploads/${c.picture}`}
                                alt={c.username}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginRight: '0.75rem'
                                }}
                            />
                        )}
                        <div>
                            <strong>{c.username}</strong>{' '}
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                {new Date(c.created_at).toLocaleString()}
                            </span>
                            <p style={{ margin: '0.25rem 0' }}>{c.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
