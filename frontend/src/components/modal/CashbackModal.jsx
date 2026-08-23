import { useState, useEffect, useCallback } from 'react';
import { Button, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Cookies from 'js-cookie';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function CashbackModal({ open, onClose, onSave }) {
    const [cashbacks, setCashbacks] = useState([]);

    const meetingCookie = JSON.parse(Cookies.get('meeting') || '{}');
    const meetingId = meetingCookie.id;
    const sessionId = meetingCookie.sessionId;

    const showSnackbar = useSnackbar();

    const fetchUserCashbacks = useCallback(async () => {
        try {
            const allCatsRes = await fetch(`${API_URL}/cashback-categories`);
            const allCategories = await allCatsRes.json();

            const userCatsRes = await fetch(
                `${API_URL}/meetings/${meetingId}/cashback-categories`,
                {
                    headers: { 'session-id': sessionId },
                },
            );
            const userCategories = await userCatsRes.json();

            const merged = allCategories.map((cat) => {
                const userSetting = userCategories.find((u) => u.category_id === cat.id);
                return {
                    category_id: cat.id,
                    name: cat.name,
                    percent: userSetting ? userSetting.percent : 0,
                };
            });

            setCashbacks(merged);
        } catch (e) {
            showSnackbar(e.message);
        }
    }, [meetingId, sessionId, showSnackbar]);

    useEffect(() => {
        if (open && meetingId) {
            const loadData = async () => {
                await fetchUserCashbacks();
            };
            loadData();
        }
    }, [open, meetingId, fetchUserCashbacks]);

    const handleAmountChange = (categoryId, delta) => {
        setCashbacks((prev) =>
            prev.map((item) => {
                if (item.category_id === categoryId) {
                    const newValue = Math.max(
                        0,
                        Math.min(100, (item.percent || 0) + delta),
                    );
                    return { ...item, percent: newValue };
                }
                return item;
            }),
        );
    };

    const handleSave = async () => {
        try {
            const payload = {
                categories: cashbacks.map((c) => ({
                    category_id: c.category_id,
                    percent: c.percent,
                })),
            };

            const res = await fetch(
                `${API_URL}/meetings/${meetingId}/cashback-categories`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'session-id': sessionId,
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (res.ok) {
                showSnackbar('Сохранено!', 'success');
                if (onSave) onSave();
                onClose();
            } else {
                const errorData = await res.json().catch(() => ({}));
                showSnackbar(errorData.detail || 'Ошибка при сохранении');
            }
        } catch (e) {
            showSnackbar('Ошибка сети при сохранении', e);
        }
    };

    const controlBtnClass =
        '!min-w-[44px] !w-[44px] !h-[36px] !bg-[#463628] !text-[#F8F4EC] !rounded-lg !text-xl !font-bold !p-0 !shadow-none hover:!bg-[#3a2c20]';

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: { className: '!bg-[#F8F4EC] !rounded-[24px] !p-4 !m-4' },
            }}
        >
            <IconButton
                onClick={onClose}
                className="!absolute !top-3 !right-3 !text-[#463628]"
            >
                <CloseIcon />
            </IconButton>

            <div className="text-center pt-4 pb-2">
                <Typography className="!font-black !text-[#463628] !text-2xl uppercase">
                    Мои кэшбэки
                </Typography>
            </div>

            <DialogContent className="!flex !flex-col !gap-6 !px-2">
                {cashbacks.map((item) => (
                    <div
                        key={item.category_id}
                        className="flex flex-col items-center gap-2"
                    >
                        <Typography className="!font-extrabold !text-[#463628] !text-base uppercase tracking-widest text-center">
                            {item.name}
                        </Typography>
                        <div className="flex items-center justify-center gap-4 w-full">
                            <Button
                                variant="contained"
                                className={controlBtnClass}
                                onClick={() => handleAmountChange(item.category_id, -1)}
                            >
                                -
                            </Button>
                            <Typography className="!font-black !text-[#463628] !text-[2.5rem] !w-[100px] text-center">
                                {item.percent}%
                            </Typography>
                            <Button
                                variant="contained"
                                className={controlBtnClass}
                                onClick={() => handleAmountChange(item.category_id, 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                ))}
            </DialogContent>

            <div className="pt-4 px-2">
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSave}
                    className="!bg-[#463628] !text-[#F8F4EC] !font-bold !rounded-xl !py-3"
                >
                    СОХРАНИТЬ
                </Button>
            </div>
        </Dialog>
    );
}
