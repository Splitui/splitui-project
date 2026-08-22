import {
    Drawer,
    IconButton,
    Button,
    Avatar,
    TextField,
    MenuItem,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Cookies from 'js-cookie';
import PersonIcon from '@mui/icons-material/Person';
import { BANKS, FIELD_SX } from '../Options';
import { useState } from 'react';
import CashbackModal from './CashbackModal';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function UserModal({
    open,
    onClose,
    user,
    meetingUUID,
    participantId,
    onSave,
    isEditable = true,
    roomStatus = 'active',
}) {
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
            setBank(
                user.bank_id || BANKS.find((b) => b.label === user.bank_name)?.value || 1,
            );
        }
    }

    const handleSave = async () => {
        const allData = {
            nickname: nickname.trim(),
            card_number: cardNumber.trim() || '',
            phone_number: phoneNumber.trim() || '',
            bank_id: Number(bank),
        };

        try {
            const cookie = JSON.parse(Cookies.get('meeting') || '{}');
            const res = await fetch(
                `${API_URL}/meetings/${meetingUUID}/participants/me`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'session-id': cookie.sessionId,
                    },
                    body: JSON.stringify(allData),
                },
            );

            if (res.ok) {
                const cookie = JSON.parse(Cookies.get('meeting') || '{}');
                if (cookie.participantId === participantId) {
                    Cookies.set(
                        'meeting',
                        JSON.stringify({
                            ...cookie,
                            userName: allData.nickname,
                            card_number: allData.card_number,
                            phone_number: allData.phone_number,
                            bank_id: allData.bank_id,
                        }),
                    );
                }

                showSnackbar('Сохранено!', 'success');
                onSave(allData);
                onClose();
            } else {
                showSnackbar('Ошибка при сохранении. Проверьте карту/телефон.');
            }
        } catch (e) {
            showSnackbar('Нет связи с сервером', e);
        }
    };

    const canEdit = isEditable && roomStatus === 'active';

    const CUSTOM_FIELD_SX = {
        ...FIELD_SX,
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: 'transparent' },
            '&.Mui-focused fieldset': { borderColor: '#463628' },
        },
        '& .MuiInputLabel-root': { color: '#9C907E' },
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
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
                    },
                },
            }}
        >
            <div className="w-12 h-1.5 bg-[#D9D3C7] rounded-full mx-auto mt-3 mb-1" />

            <div className="relative px-6 pt-2 pb-4">
                <div className="flex justify-between items-center mb-6">
                    <Typography className="!font-extrabold !text-[#463628] !text-2xl">
                        {canEdit ? 'Мои данные' : 'Данные участника'}
                    </Typography>
                    <IconButton onClick={onClose} className="!text-[#463628]">
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <Avatar className="!w-20 !h-20 !bg-[#EAE0CD]">
                        <PersonIcon className="!text-4xl !text-[#F8F4EC]" />
                    </Avatar>
                    <div className="flex-1">
                        <Typography className="!font-bold !text-[#463628] !text-xl">
                            {nickname || 'Имя не указано'}
                        </Typography>
                        <Typography className="!text-[#9C907E] !text-sm">
                            {user?.is_creator ? 'Создатель встречи' : 'Участник'}
                        </Typography>
                    </div>
                    {canEdit && (
                        <Button
                            variant="outlined"
                            className="!border-[#EAE0CD] !text-[#463628] !rounded-xl !normal-case !px-4 !bg-[#FFFFFF]"
                        >
                            Фото
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-5 mb-8">
                    <TextField
                        fullWidth
                        label="Имя в комнате"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        sx={CUSTOM_FIELD_SX}
                        slotProps={{ input: { readOnly: !canEdit } }}
                    />
                    <TextField
                        fullWidth
                        label="Номер карты"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        sx={CUSTOM_FIELD_SX}
                        slotProps={{ input: { readOnly: !canEdit } }}
                    />
                    <TextField
                        fullWidth
                        label="Номер телефона"
                        placeholder="+7 (999) 000-00-00"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        sx={CUSTOM_FIELD_SX}
                        slotProps={{ input: { readOnly: !canEdit } }}
                    />
                    <TextField
                        select
                        fullWidth
                        label="Выберите банк"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        sx={CUSTOM_FIELD_SX}
                        slotProps={{ input: { readOnly: !canEdit } }}
                    >
                        {BANKS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {canEdit && (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setCashbackOpen(true)}
                            className="!border-[#D9D3C7] !text-[#463628] font-bold !rounded-2xl py-4 hover:!bg-[#EAE0CD] !normal-case !text-base !bg-[#FFFFFF]"
                        >
                            МОИ КЭШБЕКИ
                        </Button>
                    )}
                </div>

                {canEdit && (
                    <div className="pb-6">
                        <p className="text-[12px] text-[#9C907E] text-center mb-4 leading-tight">
                            Нажимая «Сохранить», вы подтверждаете согласие на обработку
                            персональных данных. Указанные данные будут видны другим
                            участникам этой встречи.
                        </p>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSave}
                            className="!bg-[#32281E] !text-[#F8F4EC] font-bold !rounded-2xl py-4 !text-lg !shadow-none hover:!bg-[#463628] !normal-case"
                        >
                            Сохранить
                        </Button>
                    </div>
                )}
            </div>

            <CashbackModal open={cashbackOpen} onClose={() => setCashbackOpen(false)} />
        </Drawer>
    );
}
