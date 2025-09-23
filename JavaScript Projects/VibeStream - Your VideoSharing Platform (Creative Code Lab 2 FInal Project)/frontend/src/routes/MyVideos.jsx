/*
 * The MyVideos component loads and shows all videos uploaded by the current user,
 * provides a search box and category navigation to narrow down the list,
 * and lets the user delete any of their videos with a confirmation prompt.
 *
 * On mount, we call the `/videos/mine` API to fetch and store the user's videos.
 * We also read the `search` query parameter from the URL and lowercase it
 * so that matching is case-insensitive.
 *
 * Every render, we first filter the videos by the search term—checking title,
 * description, and category, then, if a category is selected via CategoryNav,
 * we further narrow down to that category.
 *
 * If no videos remain after filtering, we show a simple message;
 * otherwise, we display each VideoCard in a responsive 3-column grid,
 * wiring up a delete handler that confirms with the user, deletes the video
 * on the server, and removes it from local state so the UI updates immediately.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api       from '../services/api';
import VideoCard from '../components/VideoCard';
import CategoryNav from '../components/CategoryNav';

export default function MyVideos() {
    const [videos, setVideos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchParams] = useSearchParams();
    const q = searchParams.get('search')?.toLowerCase() || '';

    useEffect(() => {
        api.get('/videos/mine')
            .then(res => setVideos(res.data))
            .catch(console.error);
    }, []);

    const handleDelete = async video => {
        if (!window.confirm('Delete this video?')) return;
        try {
            await api.delete(`/videos/${video.id}`);
            setVideos(videos.filter(v => v.id !== video.id));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete');
        }
    };

    // 1) filter by search text
    let filtered = videos.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );

    // 2) filter by category if selected
    if (selectedCategory) {
        filtered = filtered.filter(v => v.category === selectedCategory);
    }

    return (
        <div style={{ padding: '2rem' }}>
            <CategoryNav
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {filtered.length === 0 ? (
                <p>No videos match your criteria.</p>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2rem'
                    }}
                >
                    {filtered.map(v => (
                        <VideoCard
                            key={v.id}
                            video={v}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
