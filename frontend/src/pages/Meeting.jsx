import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Meeting() {
    const { meetingUUID } = useParams();

    useEffect(() => {
        console.log('Айди встречи: ' + meetingUUID);
    }, [meetingUUID]);

    return (
        <div>
            <h1>Страница встречи</h1>
            <p>Айди встречи: {meetingUUID}</p>
        </div>
    );
}

export default Meeting;
