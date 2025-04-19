'use client';
export default function NotFound() {
    return (
        <div>
            <h1>404 - Not Found</h1>
            <p style={{ marginTop: '10px' }}>The page you are looking for does not exist.</p>
            <a href="/" style={{ fontWeight: '500', marginTop: '10px', display: 'block', color: '#0000EE', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>Go back to overview</a>
        </div>
    );
};