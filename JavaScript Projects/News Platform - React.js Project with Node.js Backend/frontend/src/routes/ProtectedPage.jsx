import React from 'react';
import ContentCard from '../components/ContentCard';
// example imports—swap these for your real asset paths:
import sample1 from '../assets/logo.png'; // Replace with actual image paths
import sample2 from '../assets/logo.png';
import sample3 from '../assets/logo.png';
import ChatAgent from "../components/ChatAgent.jsx";

export default function ProtectedPage() {
    const cards = [
        {
            title: 'Breaking News: React 20 Released',
            image: sample1,
            description: 'React 20 is out today with a bunch of new hooks and performance improvements.'
        },
        {
            title: 'How to Secure Your APIs',
            image: sample2,
            description: 'A deep dive into JWT, OAuth2, and best practices for securing your endpoints.'
        },
        {
            title: 'UI/UX Trends in 2025',
            image: sample3,
            description: 'From neumorphism to glassmorphism—what design patterns are dominating this year?'
        },
        {
            title: 'Node.js Performance Tips',
            image: sample1,
            description: 'Learn how to optimize your Node.js applications for better performance and scalability.'
        },
        {
            title: 'Understanding Microservices',
            image: sample2,
            description: 'A beginner’s guide to microservices architecture and how it can benefit your projects.'
        },
        {
            title: 'The Future of AI',
            image: sample3,
            description: 'Exploring how AI is changing the landscape of web development and what to expect next.'
        },
        {
            title: 'Building Applications with React',
            image: sample1,
            description: 'Tips and tricks for building scalable applications using React and its ecosystem.'
        },
        {
            title: 'GraphQL vs REST: Which is Better?',
            image: sample2,
            description: 'A comparison of GraphQL and REST APIs, their pros and cons, and when to use each.'
        },
        {
            title: 'DevOps Best Practices',
            image: sample3,
            description: 'An overview of DevOps practices that can help streamline your development workflow.'
        }
    ];

    return (
        <div>
            <h2>Dashboard</h2>
            <div className="content-grid">
                {cards.map((c, i) => (
                    <ContentCard
                        key={i}
                        title={c.title}
                        image={c.image}
                        description={c.description}
                    />
                ))}
            </div>
            <ChatAgent />
        </div>
    );
}
