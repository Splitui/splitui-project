import { Avatar } from '@mui/material';
import { useState } from 'react';
import UserModal from './UserModal';

export default function UserAvatar({ userName }) {
    const firstLetterUserName = userName?.charAt(0).toUpperCase() || 'Ю';
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = (data) => {
        console.log('Данные из аватара:', data);
    };

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
                userName={userName}
                onSave={handleSave}
            />
        </>
    );
}
