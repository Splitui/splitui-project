import { useState } from 'react';
import Cookies from 'js-cookie';
import { Button, Dialog, DialogContent, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FIELD_SX } from '../Options';

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
            slotProps={{
                paper: {
                    className: '!bg-[#F8F4EC] !rounded-[25px] !p-4 !shadow-lg',
                },
            }}
        >
            <IconButton
                onClick={onClose}
                className="!absolute !right-3 !top-3 !text-[#463628]"
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <div className="flex flex-col gap-3">
                    <h6 className="!text-[#463628] !font-black !text-center !text-2xl !uppercase !mb-8 !tracking-wider">
                        Редактировать встречу
                    </h6>
                    <TextField
                        fullWidth
                        label="Название встречи"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={FIELD_SX}
                    />
                    <TextField
                        fullWidth
                        label="Дата"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={FIELD_SX}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        className="!bg-[#463628] !text-[#F8F4EC] !font-bold !py-4 !rounded-xl !text-base !shadow-none hover:!bg-[#3a2c20] !transition-colors"
                    >
                        СОХРАНИТЬ ИЗМЕНЕНИЯ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
