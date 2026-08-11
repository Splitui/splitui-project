import { useState } from 'react';
import { Avatar, Drawer } from '@mui/material';

export default function UserAvatar({ userName }) {
    const [isOpen, setIsOpen] = useState(false);
    const firstLetterUserName = userName?.charAt(0).toUpperCase() || 'Ю';

    const handleClickOpen = () => {
        setIsOpen(true);
    };

    const handleClickClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <Avatar onClick={handleClickOpen} className="font-bold bg-black">
                {firstLetterUserName}
            </Avatar>

            <Drawer anchor="bottom" open={isOpen} onClose={handleClickClose}>
                <div className="p-6 flex flex-col gap-4 min-h-[300px]">
                    <div className="flex justify-between items-center w-full">
                        <h2 className="text-xl font-bold">Профиль</h2>
                        <button
                            onClick={handleClickClose}
                            className="font-bold text-2xl px-2"
                        >
                            ☓
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold">Имя</h3>
                        <input
                            type="text"
                            defaultValue={userName}
                            className="border-2 border-black p-2 outline-none font-bold"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold">Реквизиты</h3>
                        <input
                            type="text"
                            className="border-2 border-black p-2 outline-none font-bold"
                        />
                    </div>
                </div>
            </Drawer>
        </>
    );
}
