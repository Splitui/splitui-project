import { Box, Button } from '@mui/material';
import { useState } from 'react';
import Slider from '../components/sliderComponents/Slider';
import AddMeeting from '../components/modal/AddMeeting';
import Cookies from 'js-cookie';
import JoinMeeting from '../components/modal/JoinMeeting';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InviteMeeting from '../components/modal/InviteMeeting';

const chechSavedMeeting = (inviteId) => {
    if (inviteId) return false;

    try {
        const cookie = JSON.parse(Cookies.get('meeting') || '{}');
        return !!cookie.id;
    } catch {
        return false;
    }
};

export default function Home() {
    const [openAdd, setOpenAdd] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const inviteId = searchParams.get('join');
    const [openJoin, setOpenJoin] = useState(chechSavedMeeting(inviteId));
    const [openInviteModal, setOpenInviteModal] = useState(!!inviteId);

    const handleJoined = (uuid) => {
        navigate(`/meetings/${uuid}`);
    };
    return (
        <div className="h-screen py-8 flex flex-col items-center gap-6 bg-[#F8F4EC]">
            <Box className="flex flex-col w-full flex-1 min-h-0">
                <Slider />
            </Box>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: '#463628',
                    color: '#F8F4EC',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                        backgroundColor: '#3a2c20',
                    },
                }}
                onClick={() => setOpenAdd(true)}
            >
                Создание встречи
            </Button>
            <AddMeeting open={openAdd} onClose={() => setOpenAdd(false)} />
            <Button
                variant="contained"
                sx={{
                    backgroundColor: '#EAE0CD',
                    color: '#463628',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    boxShadow: 'none',
                    '&:hover': {
                        backgroundColor: '#ddd0b5',
                        boxShadow: 'none',
                    },
                }}
                onClick={() => setOpenJoin(true)}
            >
                Вход в встречу
            </Button>
            <JoinMeeting open={openJoin} onClose={() => setOpenJoin(false)} />
            <InviteMeeting
                open={openInviteModal}
                onClose={() => setOpenInviteModal(false)}
                meetingId={inviteId}
                onJoined={handleJoined}
            />
        </div>
    );
}
