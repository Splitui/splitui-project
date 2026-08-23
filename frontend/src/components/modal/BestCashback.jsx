import { useState, useEffect } from 'react';
import { Drawer, IconButton, Avatar, Button, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Cookies from 'js-cookie';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function BestCashback({ open, onClose }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [rankings, setRankings] = useState([]);
    const showSnackbar = useSnackbar();

    const meetingCookie = JSON.parse(Cookies.get('meeting') || '{}');
    const meetingId = meetingCookie.id;
    const sessionId = meetingCookie.sessionId;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/cashback-categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                    if (data.length > 0) setSelectedCategoryId(data[0].id);
                }
            } catch (e) {
                showSnackbar('Ошибка сети при загрузке категорий', e);
            }
        };
        if (open) fetchCategories();
    }, [open, showSnackbar]);

    useEffect(() => {
        const fetchRankings = async () => {
            if (!selectedCategoryId || !meetingId || !open) return;
            try {
                const res = await fetch(
                    `${API_URL}/meetings/${meetingId}/cashback-categories/${selectedCategoryId}`,
                    {
                        headers: { 'session-id': sessionId },
                    },
                );
                if (res.ok) {
                    const data = await res.json();
                    setRankings(data);
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    showSnackbar(errorData.detail || 'Не удалось загрузить рейтинг');
                }
            } catch (e) {
                showSnackbar('Ошибка сети при загрузке рейтинга', e);
            }
        };
        fetchRankings();
    }, [selectedCategoryId, meetingId, open, sessionId, showSnackbar]);

    const winner = rankings[0];
    const others = rankings.slice(1);

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        borderTopLeftRadius: '32px',
                        borderTopRightRadius: '32px',
                        backgroundColor: '#F7F1E3',
                        backgroundImage: 'none',
                        width: '100%',
                        maxWidth: '100%',
                        margin: '0 auto',
                    },
                },
            }}
        >
            <div className="w-12 h-1 bg-[#D9D3C7] rounded-full mx-auto mt-3" />

            <div className="px-6 pt-4 pb-8 flex flex-col gap-6">
                <div className="relative">
                    <Typography className="!font-extrabold !text-[#463628] !text-2xl !leading-tight pr-8">
                        Кому выгоднее оплатить
                    </Typography>
                    <Typography className="!text-[#9C907E] !text-[14px] mt-1">
                        Выберите категорию — покажем участника с лучшим кешбэком
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        className="!absolute !top-0 !right-[-8px] !text-[#463628]/50"
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`flex items-center px-4 py-2 rounded-2xl font-bold text-sm transition-all shadow-sm
                                ${selectedCategoryId === cat.id ? 'bg-[#32281E] text-[#F8F4EC]' : 'bg-[#EAE0CD] text-[#463628]'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {winner ? (
                    <div className="bg-[#32281E] rounded-[28px] p-5 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-4">
                            <Avatar
                                sx={{
                                    width: 60,
                                    height: 60,
                                    bgcolor: '#EAE0CD',
                                    color: '#32281E',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {winner.nickname?.[0].toUpperCase()}
                            </Avatar>
                            <div>
                                <Typography className="!text-[#9C907E] !text-xs !font-bold uppercase tracking-wider">
                                    Выгоднее оплатить
                                </Typography>
                                <Typography className="!text-[#F8F4EC] !text-2xl !font-black">
                                    {winner.nickname}
                                </Typography>
                            </div>
                        </div>
                        <div className="text-right">
                            <Typography className="!text-[#DAB672] !text-3xl !font-black leading-none">
                                {winner.percent}%
                            </Typography>
                            <Typography className="!text-[#9C907E] !text-[10px] !font-bold uppercase mt-1">
                                кешбэк
                            </Typography>
                        </div>
                    </div>
                ) : (
                    <Typography className="text-center !text-[#9C907E] py-4">
                        Значение кешбеков не выставлено
                    </Typography>
                )}

                {others.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <Typography className="!text-[#9C907E] !text-[11px] !font-bold uppercase tracking-widest ml-1">
                            Остальные участники
                        </Typography>
                        <div className="flex flex-col gap-3">
                            {others.map((p) => (
                                <div
                                    key={p.participant_id}
                                    className="flex items-center justify-between px-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: '#EAE0CD',
                                                color: '#463628',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {p.nickname?.[0].toUpperCase()}
                                        </Avatar>
                                        <Typography className="!text-[#463628] !font-bold !text-base">
                                            {p.nickname}
                                        </Typography>
                                    </div>
                                    <Typography className="!text-[#463628]/60 !font-bold !text-base">
                                        {p.percent}%
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    fullWidth
                    onClick={onClose}
                    variant="contained"
                    className="!bg-[#32281E] !text-[#F8F4EC] !py-4 !rounded-2xl !font-bold !text-lg !normal-case !shadow-none mt-2"
                >
                    Понятно
                </Button>
            </div>
        </Drawer>
    );
}
