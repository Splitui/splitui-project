import { useState } from 'react';
import Cookies from 'js-cookie';
import { Drawer, Button, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

const CUSTOM_FIELD_SX = {
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        '& fieldset': {
            borderColor: '#E8DFC7',
        },
        '&:hover fieldset': {
            borderColor: '#D4C9B0',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#8A7C66',
            borderWidth: '1px',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#8A7C66',
        fontSize: '14px',
        '&.Mui-focused': {
            color: '#2E2519',
        },
    },
    '& .MuiInputBase-input': {
        padding: '16px',
        color: '#2E2519',
        fontWeight: '500',
    },
};

export default function EditMeeting({
    open,
    onClose,
    meetingId,
    meetingName,
    meetingDate,
    onSave,
}) {
    const [name, setName] = useState(meetingName);
    const [date, setDate] = useState(meetingDate);
    const showSnackbar = useSnackbar();

    const handleSave = async () => {
        try {
            const cookie = JSON.parse(Cookies.get('meeting') || '{}');
            const res = await fetch(`${API_URL}/meetings/${meetingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'session-id': cookie.sessionId,
                },
                body: JSON.stringify({
                    title: name.trim(),
                    start_date: new Date(date).toISOString(),
                }),
            });

            if (res.ok) {
                const cookie = JSON.parse(Cookies.get('meeting') || '{}');
                Cookies.set(
                    'meeting',
                    JSON.stringify({
                        ...cookie,
                        name: name.trim(),
                        date: date,
                    }),
                );

                onSave(name.trim(), date);
                showSnackbar('Встреча обновлена!', 'success');
                onClose();
            } else {
                showSnackbar('Не удалось сохранить изменения');
            }
        } catch (e) {
            console.error(e);
            showSnackbar('Ошибка соединения');
        }
    };

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
                        margin: 0,
                    },
                },
            }}
        >
            <div className="w-12 h-1.5 bg-[#D9D3C7] rounded-full mx-auto mt-3 mb-1" />

            <div className="flex justify-between items-center px-6 pt-4 pb-5">
                <h2 className="text-[24px] font-bold text-[#2E2519]">Настройки</h2>
                <IconButton onClick={onClose} sx={{ color: '#8A7C66', p: 0.5 }}>
                    <CloseIcon sx={{ fontSize: '28px' }} />
                </IconButton>
            </div>

            <div className="px-6 pb-4">
                <div className="flex flex-col gap-5">
                    <TextField
                        fullWidth
                        label="Название встречи"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={CUSTOM_FIELD_SX}
                    />

                    <TextField
                        fullWidth
                        label="Дата проведения"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={CUSTOM_FIELD_SX}
                    />
                </div>
            </div>
            <div className="px-6 pb-8 pt-4">
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    sx={{
                        py: 2,
                        borderRadius: '20px',
                        backgroundColor: '#2E2519',
                        color: '#F7F1E3',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#463628',
                            boxShadow: 'none',
                        },
                    }}
                >
                    Сохранить изменения
                </Button>
            </div>
        </Drawer>
    );
}
