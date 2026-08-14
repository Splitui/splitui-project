import { Avatar } from '@mui/material';
import { useState } from 'react';
import UserModal from './modal/UserModal';

export default function UserAvatar({ userName, meetingId, participantId, onNameChange }) {
    const nameString = typeof userName === 'object' ? userName.nickname : userName;
    const name = nameString || 'Юзер';

    const firstLetterUserName = name.charAt(0).toUpperCase();
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
                userName={name}
                meetingUUID={meetingId}
                participantId={participantId}
                onSave={onNameChange}
            />
        </>
    );
}
