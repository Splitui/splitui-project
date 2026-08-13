import {
    Dialog,
    DialogContent,
    IconButton,
    Button,
    useTheme,
    useMediaQuery,
    TextField,
    MenuItem,
    Typography,
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { CASHBACK_OPTIONS, FIELD_SX, MENU_PROPS } from '../Options';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_BASE = API_URL;

export default function AddExpense({ open, onClose }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const nameRef = useRef(null);
    const amountRef = useRef(null);

    const [paidBy, setPaidBy] = useState('');
    const [payer, setPayer] = useState('');
    const [cashbackCategory, setCashbackCategory] = useState('');
    const [receipt] = useState(null);

    const [usersOptions, setUsersOptions] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);

    useEffect(() => {
        if (!open) return;

        const meetingUuid = Cookies.get('meetingId');
        if (!meetingUuid) {
            setUsersError('Не найден UUID встречи');
            return;
        }

        const controller = new AbortController();

        const fetchParticipants = async () => {
            setUsersLoading(true);
            setUsersError(null);
            try {
                const response = await fetch(
                    `${API_BASE}/${meetingUuid}/participants?limit=100&offset=0`,
                    { signal: controller.signal },
                );

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки участников: ${response.status}`);
                }

                const data = await response.json();

                setUsersOptions(
                    data.map((participant) => ({
                        value: participant.id,
                        label: participant.nickname,
                    })),
                );
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setUsersError(err.message);
                }
            } finally {
                setUsersLoading(false);
            }
        };

        fetchParticipants();

        return () => controller.abort();
    }, [open]);

    const handleReceiptView = () => {};

    const handleReceiptUpload = () => {};

    const handleSave = () => {
        console.log({
            expenseName: nameRef.current.value.trim(),
            amount: amountRef.current.value.trim(),
            paidBy,
            payer,
            cashbackCategory,
            receipt,
        });
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    className: `!bg-[#EAE0CD] p-4 sm:p-6 ${fullScreen ? '!rounded-none' : '!rounded-[20px]'}`,
                },
            }}
        >
            <IconButton
                onClick={onClose}
                className="!absolute top-3 right-3 !text-[#463628]"
            >
                <CloseIcon />
            </IconButton>

            <Box className="text-center pt-4 pb-2">
                <Typography className="!font-extrabold !text-[#463628] !text-3xl !sm:text-2xl !tracking-[0.02em]">
                    Новый расход
                </Typography>
            </Box>

            <DialogContent className="flex flex-col gap-6 py-6">
                <TextField
                    fullWidth
                    label="Название расхода"
                    inputRef={nameRef}
                    sx={FIELD_SX}
                />
                <TextField
                    fullWidth
                    label="Сумма"
                    type="number"
                    inputRef={amountRef}
                    sx={FIELD_SX}
                />

                {usersError && (
                    <Typography className="text-[#d32f2f] text-sm">
                        {usersError}
                    </Typography>
                )}

                <TextField
                    select
                    fullWidth
                    label="Кто платил"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    sx={FIELD_SX}
                    disabled={usersLoading}
                    slotProps={{ select: { MenuProps: MENU_PROPS } }}
                >
                    {usersOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    fullWidth
                    label="Кто должен оплатить"
                    value={payer}
                    onChange={(e) => setPayer(e.target.value)}
                    sx={FIELD_SX}
                    disabled={usersLoading}
                    slotProps={{ select: { MenuProps: MENU_PROPS } }}
                >
                    {usersOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    fullWidth
                    label="Категория кэшбека"
                    value={cashbackCategory}
                    onChange={(e) => setCashbackCategory(e.target.value)}
                    sx={FIELD_SX}
                    slotProps={{ select: { MenuProps: MENU_PROPS } }}
                >
                    {CASHBACK_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleReceiptView}
                    className="!border-2 !border-[#463628] !text-[#463628] font-bold !rounded-lg py-3 hover:!bg-[#463628]"
                >
                    ПОСМОТРЕТЬ ЧЕК
                </Button>
            </DialogContent>

            <Box className="px-6 pb-2 flex flex-col gap-3">
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleReceiptUpload}
                    className="!bg-[#DAB672] !text-[#463628] font-bold !rounded-lg py-3 text-base !shadow-none hover:!bg-[#c9a25f]"
                >
                    ДОБАВИТЬ ЧЕК
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSave}
                    className="!bg-[#463628] !text-[#F8F4EC] font-bold !rounded-lg py-3 text-base !shadow-none hover:!bg-[#3a2c20]"
                >
                    СОХРАНИТЬ РАСХОД
                </Button>
            </Box>
        </Dialog>
    );
}
