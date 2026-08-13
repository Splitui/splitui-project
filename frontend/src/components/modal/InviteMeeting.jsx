import { Dialog, TextField, Button, IconButton } from '@mui/material';
import { useRef } from 'react';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function InviteMeeting({ open, onClose, meetingId, onJoined }) {
    const nameRef = useRef(null);

    const handleJoin = async () => {
        const name = nameRef.current.value.trim();
        if (!name) return;

        try {
            const meetingRes = await fetch(`${API_URL}/meetings/${meetingId}`);
            const meetingData = await meetingRes.json();

            const res = await fetch(`${API_URL}/${meetingId}/participants`, {
                method: `Post`,
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ nickname: name }),
            });
            if (res.ok) {
                const meetingDate = meetingData.start_date
                    ? meetingData.start_date.split(' ')[0]
                    : '';
                Cookies.set(
                    'meeting',
                    JSON.stringify({
                        id: meetingId,
                        admin: name,
                        name: meetingData.title,
                        date: meetingDate,
                    }),
                );
                onJoined(meetingId);
            }
        } catch (e) {
            console.error('Не получилось войти', e);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            PaperProps={{
                sx: { borderRadius: '25px', p: 2, backgroundColor: '#F8F4EC' },
            }}
        >
            <div className="relative p-6 flex sm:p-10 flex-col items-center">
                <div className="absolute right-2 top-2">
                    <IconButton onClick={onClose} sx={{ color: '#463628' }}>
                        ☓
                    </IconButton>
                </div>

                <div className="text-center mt-6 mb-5">
                    <h2 className="text-[#463628] font-black text-3xl sm:text-4xl mb-5">
                        ИДЕАЛЬНОЕ ПУТЕШЕСТВИЕ
                    </h2>
                    <p className="text-[#463628] text-lg font-medium mt-1 opacity-80">
                        УЖЕ ЗДЕСЬ
                    </p>
                </div>

                <div className="w-full flex flex-col gap-8">
                    <TextField
                        fullWidth
                        label="Твое имя"
                        variant="outlined"
                        inputRef={nameRef}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '15px',
                                '& fieldset': { borderColor: '#463628' },
                            },
                            '& label': { color: '#463628' },
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleJoin}
                        sx={{
                            backgroundColor: '#463628',
                            color: '#F8F4EC',
                            py: 2,
                            borderRadius: '15px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            '&:hover': { backgroundColor: '#3a2c20' },
                        }}
                    >
                        ВОЙТИ В КОМНАТУ
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
