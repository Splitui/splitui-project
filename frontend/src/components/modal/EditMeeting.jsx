import { useState } from 'react';
import Cookies from 'js-cookie';
import { Button, Dialog, DialogContent, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

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

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/meetings/${meetingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
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
                alert('Сохранено!');
                onClose();
            } else {
                alert('Ошибочка');
            }
        } catch (e) {
            console.error(e);
            alert('Сервен не отвечает');
        }
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: '20px', p: 2, bg: '#F8F4EC' } }}
        >
            <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <h6 className="font-bold mb-3 text-center color-[#463628]">
                    Редактировать встречу
                </h6>
                <div className="flex flex-col gap-3">
                    <TextField
                        fullWidth
                        label="Название встречи"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        fullWidth
                        label="Дата"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        className="bg-[#463628] color-[#EAE0CD] py-1.5 font-bold br-12px"
                    >
                        СОХРАНИТЬ ИЗМЕНЕНИЯ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
