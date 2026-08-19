import { Box, Button } from '@mui/material';
import { useState } from 'react';
import Slider from '../components/sliderComponents/Slider';
import AddMeeting from '../components/Modal/AddMeeting';
import Cookies from 'js-cookie';
import JoinMeeting from '../components/Modal/JoinMeeting';
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
        <div className="h-screen flex flex-col items-center bg-[#E4DAC4]">
            <div className="flex flex-col w-full max-w-md flex-1 min-h-0 bg-[#F7F1E3] sm:my-4 sm:rounded-[34px] sm:shadow-2xl overflow-hidden">
                <Slider
                    onOpenAdd={() => setOpenAdd(true)}
                    onOpenJoin={() => setOpenJoin(true)}
                />
            </div>

            <AddMeeting open={openAdd} onClose={() => setOpenAdd(false)} />
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
