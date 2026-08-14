import {
    Dialog,
    DialogContent,
    IconButton,
    Button,
    Avatar,
    TextField,
    useMediaQuery,
    useTheme,
    MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Cookies from 'js-cookie';
import PersonIcon from '@mui/icons-material/Person';
import { BANKS, FIELD_SX } from './Options';
import { useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function UserModal({
    open,
    onClose,
    userName,
    meetingUUID,
    participantId,
    onSave,
    isEditable = true,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const nameRef = useRef(null);
    const cardRef = useRef(null);
    const phoneRef = useRef(null);
    const [bank, setBank] = useState(1);

    const handleSave = async () => {
        const data = {
            nickname: nameRef.current.value.trim(),
            card_number: cardRef.current.value.trim() || null,
            phone_number: phoneRef.current.value.trim() || null,
            bank_id: Number(bank),
        };
        try {
            const res = await fetch(
                `${API_URL}/${meetingUUID}/participants/${participantId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                },
            );

            if (res.ok) {
                const cookie = JSON.parse(Cookies.get('meeting') || '{}');
                Cookies.set(
                    'meeting',
                    JSON.stringify({ ...cookie, userName: data.nickname }),
                );

                alert('Сохранено!');
                onSave(data.nickname);
                onClose();
            } else {
                alert('Ошибка при сохранении на сервере.');
            }
        } catch (e) {
            alert('Нет связи с сервером', e);
        }
    };

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    className: '!bg-[#EAE0CD] rounded-[20px] p-4 sm:p-6 min-h-[500px]',
                },
            }}
        >
            <IconButton
                onClick={onClose}
                className="!absolute top-3 right-3 !text-[#463628]"
            >
                <CloseIcon />
            </IconButton>

            <div className="text-center pt-4 pb-2">
                <div className="font-extrabold text-[#463628] text-3xl">
                    {isEditable ? 'Мои данные' : 'Данные участника'}
                </div>
            </div>

            <div className="flex justify-center pb-3">
                <Avatar className="!w-24 !h-24 !bg-[#C7BEB0]">
                    <PersonIcon className="!text-5xl !text-[#F8F4EC]" />
                </Avatar>
            </div>

            <DialogContent className="flex flex-col gap-6 py-6">
                <TextField
                    key={userName}
                    fullWidth
                    label="Имя пользователя"
                    defaultValue={userName}
                    inputRef={nameRef}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                />
                <TextField
                    fullWidth
                    label="Номер карты"
                    placeholder="0000 0000 0000 0000"
                    inputRef={cardRef}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                />
                <TextField
                    fullWidth
                    label="Номер телефона"
                    placeholder="+7 (999) 000-00-00"
                    inputRef={phoneRef}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                />

                <TextField
                    select
                    fullWidth
                    label="Выберите банк"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                >
                    {BANKS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                {isEditable && (
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClose}
                        className="!border-2 !border-[#463628] !text-[#463628] font-bold !rounded-xl py-3 hover:!bg-[#463628] hover:!text-[#F8F4EC]"
                    >
                        МОИ КЭШБЕКИ
                    </Button>
                )}
            </DialogContent>

            {isEditable && (
                <div className="px-6 pb-2">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSave}
                        className="!bg-[#463628] !text-[#F8F4EC] font-bold !rounded-xl py-3 !text-base !shadow-none hover:!bg-[#3a2c20]"
                    >
                        СОХРАНИТЬ
                    </Button>
                </div>
            )}
        </Dialog>
    );
}
