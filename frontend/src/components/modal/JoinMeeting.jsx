import {
    Dialog,
    DialogContent,
    IconButton,
    Button,
    useTheme,
    useMediaQuery,
    TextField,
    Typography,
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRef } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function JoinMeeting({ open, onClose }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();

    const nameRef = useRef(null);
    const meetingIdRef = useRef(null);

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

                if (name !== userName) {
                    await fetch(
                        `${API_URL}/meetings/${meetingId}/participants/${participantId}`,
                        {
                            method: 'PATCH',
                            headers: {
                                headers,
                            },
                            body: JSON.stringify({ nickname: name }),
                        },
                    );
                }
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
                    participantId: participantId,
                    userName: name,
                    isCreator: isCreator,
                    name: meetingData.title,
                    date: meetingDate,
                    sessionId: cookie.sessionId,
                }),
            );

            onClose();
            navigate(`/meetings/${meetingId}`);
        } catch (e) {
            console.error('Ошибочка', e);
            showSnackbar('Нет связи с сервером');
        }
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: '#F8F4EC',
                    borderRadius: fullScreen ? 0 : '20px',
                    p: { xs: 2, sm: 3 },
                },
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', top: 12, right: 12, color: '#463628' }}
            >
                <CloseIcon />
            </IconButton>

            <Box sx={{ textAlign: 'center', pt: 2, pb: 1 }}>
                <Typography
                    sx={{
                        fontWeight: 800,
                        color: '#463628',
                        fontSize: { xs: '1.75rem', sm: '2.5rem' },
                        lineHeight: 1.1,
                        letterSpacing: '0.03em',
                    }}
                >
                    ИДЕАЛЬНОЕ ПУТЕШЕСТВИЕ
                </Typography>
                <Typography
                    sx={{
                        color: '#463628',
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        letterSpacing: '0.05em',
                        mt: 1,
                    }}
                >
                    УЖЕ ЗДЕСЬ
                </Typography>
            </Box>

            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}
            >
                <TextField
                    fullWidth
                    label="Твое имя"
                    defaultValue={userName}
                    inputRef={nameRef}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': { borderColor: '#463628' },
                            '&:hover fieldset': { borderColor: '#463628' },
                            '&.Mui-focused fieldset': { borderColor: '#463628' },
                        },
                        '& label': { color: '#463628' },
                        '& label.Mui-focused': { color: '#463628' },
                        '& input': { color: '#463628' },
                    }}
                />
                <TextField
                    fullWidth
                    label="ID комнаты"
                    defaultValue={defaultMeetingId}
                    inputRef={meetingIdRef}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '& fieldset': { borderColor: '#463628' },
                            '&:hover fieldset': { borderColor: '#463628' },
                            '&.Mui-focused fieldset': { borderColor: '#463628' },
                        },
                        '& label': { color: '#463628' },
                        '& label.Mui-focused': { color: '#463628' },
                        '& input': { color: '#463628' },
                    }}
                />
            </DialogContent>

            <Box sx={{ px: 3, pb: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleJoin}
                    sx={{
                        backgroundColor: '#463628',
                        color: '#F8F4EC',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        py: 1.5,
                        fontSize: '1.1rem',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#3a2c20', boxShadow: 'none' },
                    }}
                >
                    ВОЙТИ В КОМНАТУ
                </Button>
            </Box>
        </Dialog>
    );
}
