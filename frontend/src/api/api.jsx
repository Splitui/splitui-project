import { useState } from 'react';

function MeetingForm() {
    const [title, setTitle] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                meeting_date: new Date().toISOString(),
                creator_name: 'User',
            }),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <button type="submit">Создать встречу</button>
        </form>
    );
}
