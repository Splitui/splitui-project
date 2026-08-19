import { useMemo, useState } from 'react';
import { CASHBACK_OPTIONS } from '../Options';
import { Dialog, IconButton, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function BestCashback({ open, onClose, participants }) {
    const [selectedCategory, setSelectedCategory] = useState(CASHBACK_OPTIONS[0].id);

    const sortedParticipants = useMemo(() => {
        return [...participants]
            .map((p) => ({
                ...p,
                cashbacksValue: p.cashback?.[selectedCategory] || 0,
            }))
            .sort((a, b) => b.cashbacksValue - a.cashbacksValue);
    }, [participants, selectedCategory]);

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    className:
                        '!bg-[#F8F4EC] !rounded-[30px] !p-4 sm:!p-6 !m-4 !max-h-[90vh]',
                },
            }}
        >
            <IconButton
                onClick={onClose}
                className="!absolute !top-3 !right-3 !text-[#463628]"
            >
                <CloseIcon />
            </IconButton>

            <h2 className="text-[#463628] font-black text-3xl text-center uppercase mt-4 mb-6 tracking-tight">
                Лучший кешбэк
            </h2>

            <div
                className="flex flex-col gap-2 overflow-y-auto pr-1 mb-6 max-h-[200px] 
                [&::-webkit-scrollbar]:w-[5px] 
                [&::-webkit-scrollbar-track]:bg-transparent 
                [&::-webkit-scrollbar-thumb]:bg-[#463628] 
                [&::-webkit-scrollbar-thumb]:rounded-full"
            >
                {CASHBACK_OPTIONS.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full py-3 px-4 rounded-[15px] font-black text-lg transition-all border-2
                            ${
                                selectedCategory === category.id
                                    ? 'bg-[#EAE0CD] border-[#463628] text-[#463628]'
                                    : 'bg-[#EAE0CD]/50 border-transparent text-[#463628]/60 hover:bg-[#EAE0CD]'
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            <div className="bg-transparent border-[1.5px] border-[#463628]/20 rounded-[25px] p-4 flex flex-col gap-3">
                <h3 className="text-[#463628] font-black text-center text-xl mb-2">
                    {' '}
                    Выгоднее оплатить
                </h3>

                <div className="flex flex-col gap-2">
                    {sortedParticipants.map((p, idx) => (
                        <div
                            key={p.id}
                            className={`flex items-center justify-between p-3 rounded-2xl transition-all
                                ${idx === 0 ? 'bg-[#EAE0CD]' : 'bg-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar
                                    sx={{ width: 35, height: 35, bgcolor: '#C7BEB0' }}
                                    src={p.avatar_url}
                                >
                                    {p.nickname?.[0]}
                                </Avatar>
                                <span
                                    className={`font-bold text-lg ${idx === 0 ? 'text-[#463628]' : 'text-[#463628]/70'}`}
                                >
                                    {p.nickname}{' '}
                                    {p.id === participants.find((x) => x.isMe)?.id
                                        ? '(Я)'
                                        : ''}
                                </span>
                            </div>

                            <div className="text-right">
                                <div
                                    className={`font-black text-xl leading-none ${idx === 0 ? 'text-[#32935A]' : 'text-[#463628]/50'}`}
                                >
                                    {p.cashbackValue}%
                                </div>
                                {idx === 0 && (
                                    <div className="text-[10px] font-bold text-[#463628] uppercase">
                                        кешбэк
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Dialog>
    );
}
