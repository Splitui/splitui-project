import { Dialog, IconButton, Button, Typography, Box, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Cookies from 'js-cookie';
import { useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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

export default function AddMeeting({ open, onClose }) {
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();
    const nameRef = useRef(null);
    const dateRef = useRef(null);
    const userRef = useRef(null);

    const handleCreate = async () => {
        const meetingName = nameRef.current.value.trim();
        const rawDate = dateRef.current.value.trim();
        const userName = userRef.current.value.trim();

        if (!meetingName || !rawDate || !userName) {
            showSnackbar('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const dateObj = new Date(rawDate);
            if (isNaN(dateObj.getTime())) {
                showSnackbar('Указана некорректная дата');
                return;
            }

            const res = await fetch(`${API_URL}/meetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: meetingName,
                    start_date: dateObj.toISOString(),
                    creator_nickname: userName,
                }),
            });

            if (!res.ok) {
                showSnackbar('Не удалось создать встречу');
                return;
            }

            const data = await res.json();
            const meetingId = data.uuid;
            const creatorId = data.meeting_creator?.id;
            const sessionId = data.meeting_creator?.session_id;

            Cookies.set(
                'meeting',
                JSON.stringify({
                    name: meetingName,
                    date: rawDate,
                    participantId: creatorId,
                    sessionId: sessionId,
                    userName: userName,
                    isCreator: true,
                    id: meetingId,
                }),
            );
            onClose();
            navigate(`/meetings/${meetingId}`);
        } catch (e) {
            console.error(e);
            showSnackbar('Произошла ошибка при создании встречи');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Transition}
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
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#2E2519' }}>
                        Создайте встречу
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#8A7C66', mt: 0.5 }}>
                        Без регистрации — 10 секунд
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
                <Typography sx={labelStyle}>Название встречи</Typography>
                <input ref={nameRef} placeholder="Поездка в Москву" style={inputStyle} />
            </Box>
            <Box sx={{ mt: 1.5 }}>
                <Typography sx={labelStyle}>Дата начала</Typography>
                <input ref={dateRef} type="date" style={inputStyle} />
            </Box>
            <Box sx={{ mt: 1.5 }}>
                <Typography sx={labelStyle}>Ваше имя в комнате</Typography>
                <input ref={userRef} placeholder="Ваше имя" style={inputStyle} />
            </Box>
            <Box
                sx={{
                    mt: 2,
                    p: '13px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#F1E7D0',
                    display: 'flex',
                    gap: 1.25,
                    alignItems: 'flex-start',
                }}
            >
                <span style={{ fontSize: 15 }}>🔗</span>
                <Typography sx={{ fontSize: 12.5, color: '#5C5142', lineHeight: 1.45 }}>
                    После создания вы получите ссылку — отправьте её друзьям, аккаунты им
                    не нужны.
                </Typography>
            </Box>
            <Button
                fullWidth
                onClick={handleCreate}
                sx={{
                    mt: 2.25,
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
                Создать комнату
            </Button>
        </Dialog>
    );
}
