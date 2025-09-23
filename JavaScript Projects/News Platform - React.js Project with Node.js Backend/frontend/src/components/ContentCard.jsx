import React from 'react';

export default function ContentCard({ title, image, description }) {
    return (
        <div className="content-card">
            <h3 className="content-card-title">{title}</h3>
            {image && (
                <img
                    src={image}
                    alt={title}
                    className="content-card-image"
                />
            )}
            <p className="content-card-desc">{description}</p>
        </div>
    );
}
