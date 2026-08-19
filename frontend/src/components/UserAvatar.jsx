import { Avatar } from '@mui/material';
import { useState } from 'react';
import UserModal from './modal/UserModal';

export default function UserAvatar({ user, meetingId, participantId, onSave }) {
    const nickname = user?.nickname || 'Юзер';
    const firstLetterUserName = nickname.charAt(0).toUpperCase();

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Avatar
                onClick={() => setIsOpen(true)}
                className="font-bold bg-black cursor-pointer"
            >
                {firstLetterUserName}
            </Avatar>

            <UserModal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                user={user}
                meetingUUID={meetingId}
                participantId={participantId}
                onSave={onSave}
            />
        </>
    );
}
