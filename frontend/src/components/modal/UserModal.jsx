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
import { BANKS, FIELD_SX } from '../Options';
import { useState } from 'react';
import CashbackModal from './CashbackModal';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function UserModal({
    open,
    onClose,
    user,
    meetingUUID,
    participantId,
    onSave,
    isEditable = true,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [nickname, setNickname] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bank, setBank] = useState(1);
    const [cashbackOpen, setCashbackOpen] = useState(false);
    const showSnackbar = useSnackbar();

    const [prevKey, setPrevKey] = useState(null);
    const currentKey = open ? user?.id || 'open' : null;

    if (currentKey !== prevKey) {
        setPrevKey(currentKey);
        if (open && user) {
            setNickname(user.nickname || '');
            setCardNumber(user.card_number || '');
            setPhoneNumber(user.phone_number || '');
            setBank(user.bank_id || 1);
        }
    }

    const handleSave = async () => {
        const allData = {
            nickname: nickname.trim(),
            card_number: cardNumber.trim() || null,
            phone_number: phoneNumber.trim() || null,
            bank_id: Number(bank),
        };

        try {
            const res = await fetch(
                `${API_URL}/meetings/${meetingUUID}/participants/${participantId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(allData),
                },
            );

            if (res.ok) {
                const cookie = JSON.parse(Cookies.get('meeting') || '{}');
                if (cookie.participantId === participantId) {
                    Cookies.set(
                        'meeting',
                        JSON.stringify({
                            id: cookie.id,
                            participantId: cookie.participantId,
                            userName: allData.nickname,
                            card_number: allData.card_number,
                            phone_number: allData.phone_number,
                            bank_id: allData.bank_id,
                            isCreator: cookie.isCreator,
                            name: cookie.name,
                            date: cookie.date,
                        }),
                    );
                }

                showSnackbar('Сохранено!', 'success');
                onSave(allData);
                onClose();
            } else {
                const errorData = await res.json();
                console.error('Ошибка валидации:', errorData);
                showSnackbar('Ошибка при сохранении. Проверьте карту/телефон.');
            }
        } catch (e) {
            showSnackbar('Нет связи с сервером');
            console.error(e);
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
                    fullWidth
                    label="Имя пользователя"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                />
                <TextField
                    fullWidth
                    label="Номер карты"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                />
                <TextField
                    fullWidth
                    label="Номер телефона"
                    placeholder="+7 (999) 000-00-00"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                        onClick={() => setCashbackOpen(true)}
                        className="!border-2 !border-[#463628] !text-[#463628] font-bold !rounded-xl py-3 hover:!bg-[#463628] hover:!text-[#F8F4EC]"
                    >
                        МОИ КЭШБЕКИ
                    </Button>
                )}
            </DialogContent>

            {isEditable && (
                <div className="px-6 pb-2">
                    <p className="text-[10px] text-[#463628] opacity-70 text-center mb-3 leading-tight">
                        Нажимая «Сохранить», вы подтверждаете согласие на обработку
                        персональных данных. Указанные данные будут видны другим
                        участникам этой встречи.
                    </p>
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

            <CashbackModal open={cashbackOpen} onClose={() => setCashbackOpen(false)} />
        </Dialog>
    );
}
