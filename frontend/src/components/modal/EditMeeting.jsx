import Cookies from 'js-cookie';
<<<<<<< HEAD
import { Button, Dialog, IconButton, Typography, Box, Slide } from '@mui/material';
=======
import { Drawer, Button, IconButton, TextField } from '@mui/material';
>>>>>>> dbbf975678d688fd1c8daa876fb4b552f2b94ac5
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from '../SnackbarProvider';
import { useState, forwardRef } from 'react';

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
        const cookie = JSON.parse(Cookies.get('meeting') || '{}');
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
                Cookies.set(
                    'meeting',
                    JSON.stringify({ ...cookie, name: name.trim(), date: date }),
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
<<<<<<< HEAD
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
=======
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
>>>>>>> dbbf975678d688fd1c8daa876fb4b552f2b94ac5
                    },
                },
            }}
        >
<<<<<<< HEAD
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
                        Редактировать встречу
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#8A7C66', mt: 0.5 }}>
                        Измените название или дату
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
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Название встречи"
                    style={inputStyle}
                />
            </Box>
            <Box sx={{ mt: 1.5 }}>
                <Typography sx={labelStyle}>Дата</Typography>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={inputStyle}
                />
            </Box>
            <Button
                fullWidth
                onClick={handleSave}
                sx={{
                    mt: 2.5,
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
                Сохранить изменения
            </Button>
        </Dialog>
=======
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
>>>>>>> dbbf975678d688fd1c8daa876fb4b552f2b94ac5
    );
}
