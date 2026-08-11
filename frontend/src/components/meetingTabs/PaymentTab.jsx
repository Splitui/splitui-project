import { useState } from 'react';
import Dialog from '@mui/material/Dialog';

export default function PaymentTab() {
    const [isOpen, setIsOpen] = useState(false);

    const handleClickOpen = () => {
        setIsOpen(true);
    };

    const handleClickClose = () => {
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <h3 className="font-bold text-lg text-center">Список чеков</h3>

            <div
                onClick={handleClickOpen}
                className="border-2 border-black p-3 flex justify-between items-center"
            >
                <div>
                    <p className="font-bold">Ресторанчик "У Копатыча"</p>
                    <p className="text-xs text-gray-500">07.08.2026</p>
                </div>
                <p className="font-bold">2500 ₽</p>
            </div>
            <div
                onClick={handleClickOpen}
                className="border-2 border-black p-3 flex justify-between items-center"
            >
                <div>
                    <p className="font-bold">Такси "#ВЛЕС"</p>
                    <p className="text-xs text-gray-500">07.08.2026</p>
                </div>
                <p className="font-bold">700 ₽</p>
            </div>
            <Dialog fullScreen open={isOpen} onClose={handleClickClose}>
                <div className="p-4">
                    <button
                        onClick={handleClickClose}
                        className="flex font-bold text-lg mb-4 ml-auto"
                    >
                        ☓
                    </button>
                    <h2 className="text-2xl font-bold">Наш чек</h2>
                    <p className="mt-4">Когда-нибудь здесь появятся долговики...</p>
                </div>
            </Dialog>
        </div>
    );
}
