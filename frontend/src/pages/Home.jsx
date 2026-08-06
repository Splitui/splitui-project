import {Button, Container, Typography} from '@mui/material';
import {useState} from 'react';
import AddMeeting from '../components/AddMeeting'
export default function Home() {
    const[open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false)
    };
    return (
        <Container className='min-h-screen py-8 flex flex-col items-center gap-6'>
            <Typography>Главная</Typography>
            <Button variant='contained' onClick={handleOpen}>Создание встречи</Button>
            <AddMeeting open={open} onClose={handleClose}/>
        </Container>
    );
}
