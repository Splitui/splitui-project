import { Dialog, IconButton, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRef } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function JoinMeeting({ open, onClose }) {
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();

    const nameRef = useRef(null);
    const meetingIdRef = useRef(null);

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
    const userName = cookie.userName || '';
    const defaultMeetingId = cookie.id || '';

    const handleJoin = async () => {
        const name = nameRef.current.value.trim();
        const meetingId = meetingIdRef.current.value.trim();

        if (!name || !meetingId) {
            showSnackbar('Введите имя и ID комнаты');
            return;
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'session-id': cookie.sessionId || '',
            };
            const response = await fetch(`${API_URL}/meetings/${meetingId}`, { headers });
            if (!response.ok) {
                showSnackbar('Комната с таким id не найдена');
                return;
            }
            const meetingData = await response.json();

            let participantId;
            let isCreator = false;

            if (cookie.id === meetingId && cookie.participantId) {
                participantId = cookie.participantId;
                isCreator = cookie.isCreator;
            } else {
                const participantsResponse = await fetch(
                    `${API_URL}/meetings/${meetingId}/participants?limit=50&offset=0`,
                    { headers },
                );
                const participantsList = participantsResponse.ok
                    ? await participantsResponse.json()
                    : [];
                const existingUser = participantsList.find((p) => p.nickname === name);
                if (existingUser) {
                    participantId = existingUser.id;
                    isCreator =
                        existingUser.is_creator === 1 || existingUser.isCreator === true;
                } else {
                    showSnackbar('Участник с таким именем не найден в комнате');
                    return;
                }
            }

            const meetingDate = meetingData.start_date
                ? meetingData.start_date.substring(0, 10)
                : '';

            Cookies.set(
                'meeting',
                JSON.stringify({
                    id: meetingId,
                    participantId,
                    userName: name,
                    isCreator,
                    name: meetingData.title,
                    date: meetingDate,
                    sessionId: cookie.sessionId,
                }),
            );

            onClose();
            navigate(`/meetings/${meetingId}`);
        } catch (e) {
            showSnackbar('Нет связи с сервером', e);
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
                        Войти в комнату
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#8A7C66', mt: 0.5 }}>
                        Вернитесь к своим расходам
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: '#9C8B6F', mt: -0.5, mr: -0.5 }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography sx={labelStyle}>Твое имя</Typography>
                <input
                    ref={nameRef}
                    defaultValue={userName}
                    placeholder="Имя"
                    style={inputStyle}
                />
            </Box>

            <Box sx={{ mt: 1.5, mb: 3 }}>
                <Typography sx={labelStyle}>ID комнаты</Typography>
                <input
                    ref={meetingIdRef}
                    defaultValue={defaultMeetingId}
                    placeholder="Например, c9f829ea..."
                    style={inputStyle}
                />
            </Box>

            <Button
                fullWidth
                variant="contained"
                onClick={handleJoin}
                sx={{
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
                ВОЙТИ В КОМНАТУ
            </Button>
        </Dialog>
    );
}
