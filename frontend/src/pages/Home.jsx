import { Box, Button } from '@mui/material';
import { useState } from 'react';
import Slider from '../components/sliderComponents/Slider';
import AddMeeting from '../components/Modal/AddMeeting';
import JoinMeeting from '../components/Modal/JoinMeeting';
export default function Home() {
    const [openAdd, setOpenAdd] = useState(false);
    const [openJoin, setOpenJoin] = useState(false);

    return (
        <div className="min-h-screen py-8 flex flex-col items-center gap-6">
            <p className="text-xl">Главная</p>
            <Box className="w-full">
                <Slider />
            </Box>
            <Button variant="contained" onClick={() => setOpenAdd(true)}>
                Создание встречи
            </Button>
            <AddMeeting open={openAdd} onClose={() => setOpenAdd(false)} />
            <Button variant="contained" onClick={() => setOpenJoin(true)}>
                Вход в встречу
            </Button>
            <JoinMeeting open={openJoin} onClose={() => setOpenJoin(false)} />
        </div>
    );
}
