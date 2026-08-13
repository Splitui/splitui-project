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
import Cookies from 'js-cookie';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function AddMeeting({ open, onClose }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const nameRef = useRef(null);
    const dateRef = useRef(null);
    const adminRef = useRef(null);

    const handleCreate = async () => {
        const meetingName = nameRef.current.value.trim();
        const rawDate = dateRef.current.value.trim();
        const adminName = adminRef.current.value.trim();

        try {
            const res = await fetch(`${API_URL}/meetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: meetingName,
                    meeting_date: new Date(rawDate).toISOString(),
                    creator_nickname: adminName,
                }),
            });
            if (!res.ok) {
                console.error('Ошибка создания:', await res.text());
                return;
            }
            const data = await res.json();
            const meetingId = data.uuid;
            Cookies.set(
                'meeting',
                JSON.stringify({
                    name: meetingName,
                    date: rawDate,
                    admin: adminName,
                    id: meetingId,
                }),
            );
            onClose();
            navigate(`/meetings/${meetingId}`);
        } catch (e) {
            console.error('Сеть недоступна:', e);
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
                        fontSize: { xs: '2.5rem', sm: '3.5rem' },
                        lineHeight: 1,
                        letterSpacing: '0.05em',
                    }}
                >
                    СОЗДАЙ
                </Typography>
                <Typography
                    sx={{
                        color: '#463628',
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        letterSpacing: '0.05em',
                        mt: 1,
                    }}
                >
                    СВОЕ ИДЕАЛЬНОЕ ПУТЕШЕСТВИЕ
                </Typography>
            </Box>

            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}
            >
                <TextField
                    fullWidth
                    label="Название комнаты"
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
                    label="Дата"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    inputRef={dateRef}
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
                    label="Имя создателя"
                    inputRef={adminRef}
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
                    onClick={handleCreate}
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
                    СОЗДАТЬ КОМНАТУ
                </Button>
            </Box>
        </Dialog>
    );
}
