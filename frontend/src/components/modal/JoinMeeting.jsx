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

export default function JoinMeeting({ open, onClose }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const userName = useRef(null);
    const meetingId = useRef(null);

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
                    inputRef={userName}
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
                    inputRef={meetingId}
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
                    onClick={onClose}
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
