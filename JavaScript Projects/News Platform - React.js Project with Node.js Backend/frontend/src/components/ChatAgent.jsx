import React, { useState, useRef, useEffect } from 'react';

export default function ChatAgent() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I\'m HighView AI. Ask me anything.' }
    ]);
    const [input, setInput] = useState('');
    const msgsEnd = useRef(null);

    // scroll to bottom on new message
    useEffect(() => {
        msgsEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const hardcodedReply = (text) => {
        const t = text.toLowerCase();
        if (t.includes('hello') || t.includes('hi') || t.includes('hey')) {
            return 'Hello there! 👋';
        }
        if (t.includes('help')) {
            return 'Sure—what do you need help with?';
        }
        if (t.includes('news')) {
            return 'Check out the Dashboard for the latest posts!';
        }
        return 'Sorry, I don’t have an answer for that.';
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMsg = { sender: 'user', text: input };
        const botMsg  = { sender: 'bot', text: hardcodedReply(input) };
        setMessages(msgs => [...msgs, userMsg, botMsg]);
        setInput('');
    };

    return (
        <>
            {open && (
                <div className="chat-agent-window">
                    <div className="chat-agent-header">
                        HighView AI
                        <button className="close-btn" onClick={() => setOpen(false)}>×</button>
                    </div>
                    <div className="chat-agent-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-agent-message ${m.sender}`}>
                                {m.text}
                            </div>
                        ))}
                        <div ref={msgsEnd} />
                    </div>
                    <form className="chat-agent-input-area" onSubmit={handleSend}>
                        <input
                            className="chat-agent-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit" className="chat-agent-send">➤</button>
                    </form>
                </div>
            )}

            <button
                className="chat-agent-button"
                onClick={() => setOpen(o => !o)}
                aria-label="Toggle chat"
            >
                💬
            </button>
        </>
    );
}
