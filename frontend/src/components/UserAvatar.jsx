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
                sx={{
                    bgcolor: '#E6D9BA',
                    color: '#7A5316',
                    fontWeight: 'bold',
                    width: 42,
                    height: 42,
                    fontSize: '18px',
                }}
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
