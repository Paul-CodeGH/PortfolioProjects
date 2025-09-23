import React, { useState } from 'react';
import './CategoryNav.css';

const categories = ['Entertainment', 'Educational', 'Automotive', 'Sports'];

export default function CategoryNav({ selected, onSelect }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(o => !o);

    const handleSelect = cat => {
        onSelect(cat === selected ? '' : cat);
        setMenuOpen(false);
    };

    return (
        <div
            className={`category-nav-wrapper${menuOpen ? ' open' : ''}`}
            style={{
                display: 'flex',
                width: '100%',
                backgroundColor: '#3F44D1',
                margin: '-2.5rem 0 2.5rem',
                borderRadius: '10px',
                height: '50px',
            }}
        >
            {/* —— Desktop buttons (hidden on mobile) —— */}
            <div className="desktop-categories">
                {categories.map(cat => {
                    const isActive = cat === selected;
                    return (
                        <button
                            key={cat}
                            onClick={() => handleSelect(cat)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'transparent',
                                color: '#FFFFFF',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.125rem',
                                fontWeight: 'normal',
                            }}
                        >
                            {isActive ? `× ${cat}` : cat}
                        </button>
                    );
                })}
            </div>

            {/* —— Mobile-only dropdown toggle & menu —— */}
            <div className="mobile-categories">
                <button className="cat-toggle" onClick={toggleMenu}>
                    {selected || 'Categories'} <span className="arrow">▾</span>
                </button>
                <div className="mobile-menu">
                    {categories.map(cat => {
                        const isActive = cat === selected;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleSelect(cat)}
                            >
                                {isActive ? `× ${cat}` : cat}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
