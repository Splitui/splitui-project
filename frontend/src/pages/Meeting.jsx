import { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function Meeting() {
    const { meetingUUID } = useParams();

    useEffect(() => {
        console.log('Айди встречи: ' + meetingUUID);
    }, [meetingUUID]);

    return (
        <Container>
            <Typography>Страница встречи</Typography>
            <Typography>Айди встречи: {meetingUUID}</Typography>
        </Container>
    );
}
