import React from 'react';

// A simple component to display a title in the navigation area
export default function TitleNav({ title }) {
    return (
        <div style={{
            display: 'flex',
            width: '100%',
            backgroundColor: '#3F44D1',
            margin: '1rem 0',       // sits just below the navbar
            borderRadius: '10px',
            height: '50px',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
      <span style={{
          color: '#FFFFFF',
          fontSize: '1.125rem',
          fontWeight: 'normal'
      }}>
        {title}
      </span>
        </div>
    );
}
