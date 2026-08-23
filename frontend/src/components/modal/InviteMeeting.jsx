import { Dialog, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRef } from 'react';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function InviteMeeting({ open, onClose, meetingId, onJoined }) {
    const nameRef = useRef(null);

    const inputStyle = {
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #D9CBAE',
        borderRadius: '11px',
        padding: '13px',
        fontSize: '15px',
        background: '#FFFDF7',
        color: '#2E2519',
        outline: 'none',
        fontFamily: 'inherit',
    };

    const labelStyle = { fontSize: 12, color: '#8A7C66', mb: 0.6 };

    const cookie = open ? JSON.parse(Cookies.get('meeting') || '{}') : {};

    const handleJoin = async () => {
        const name = nameRef.current.value.trim();
        if (!name) return;

        try {
            const meetingRes = await fetch(`${API_URL}/meetings/${meetingId}`);
            const meetingData = await meetingRes.json();

            const res = await fetch(`${API_URL}/meetings/${meetingId}/participants`, {
                method: `POST`,
                headers: {
                    'Content-type': 'application/json',
                    'session-id': cookie.sessionId || '',
                },
                body: JSON.stringify({ nickname: name }),
            });
            if (res.ok) {
                const userData = await res.json();
                const meetingDate = meetingData.start_date
                    ? meetingData.start_date.substring(0, 10)
                    : '';
                Cookies.set(
                    'meeting',
                    JSON.stringify({
                        id: meetingId,
                        participantId: userData.id,
                        userName: name,
                        isCreator: false,
                        name: meetingData.title,
                        date: meetingDate,
                        sessionId: userData.session_id,
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
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-container': { alignItems: 'flex-end' } }}
            slotProps={{
                paper: {
                    sx: {
                        m: 0,
                        width: '100%',
                        maxWidth: '100%',
                        borderRadius: '26px 26px 0 0',
                        backgroundColor: '#F7F1E3',
                        p: '10px 22px 24px',
                        maxHeight: '94%',
                    },
                },
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#D3C4A5',
                    mx: 'auto',
                    mb: 2,
                }}
            />

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#2E2519',
                            lineHeight: 1.2,
                        }}
                    >
                        Идеальное путешествие
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#8A7C66', mt: 0.5 }}>
                        Просто введи имя
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: '#9C8B6F', mt: -0.5, mr: -0.5 }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Typography sx={labelStyle}>Твое имя</Typography>
                <input ref={nameRef} placeholder="Имя" style={inputStyle} />
            </Box>

            <Button
                fullWidth
                onClick={handleJoin}
                sx={{
                    mt: 4,
                    py: 2,
                    borderRadius: '14px',
                    backgroundColor: '#2E2519',
                    color: '#F7F1E3',
                    fontSize: 16,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: '#3a2c20', boxShadow: 'none' },
                }}
            >
                Войти в комнату
            </Button>
        </Dialog>
    );
}
