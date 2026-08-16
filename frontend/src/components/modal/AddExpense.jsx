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
    Switch,
    FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { CASHBACK_OPTIONS, FIELD_SX, MENU_PROPS } from '../Options';
import Receipt from './Receipt';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_BASE = API_URL;

export default function AddExpense({ open, onClose }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const nameRef = useRef(null);
    const amountRef = useRef(null);

    const [paidBy, setPaidBy] = useState('');
    const [payer, setPayer] = useState([]);
    const [cashbackCategory, setCashbackCategory] = useState('');

    const [usersOptions, setUsersOptions] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [singleItem, setSingleItem] = useState(true);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receiptItems, setReceiptItems] = useState([]);

    useEffect(() => {
        if (!open) return;

        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
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
                    `${API_BASE}/meetings/${meetingUuid}/participants?limit=100&offset=0`,
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

    const handleReceiptView = () => setReceiptOpen(true);

    const handleReceiptUpload = () => {};

    const handleSave = async () => {
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        if (!meetingUuid) {
            console.error('Не найден UUID встречи');
            return;
        }
        if (!paidBy) {
            return;
        }
        if (!singleItem && receiptItems.length === 0) {
            setUsersError('Добавьте хотя бы одну позицию в чек');
            return;
        }
        const expenseName = nameRef.current.value.trim();
        const amount = amountRef.current ? parseFloat(amountRef.current.value) || 0 : 0;

        const items = singleItem
            ? [
                  {
                      title: expenseName,
                      unit_price: amount,
                      quantity: 1,
                      participants: payer.map((id) => ({
                          participant_id: id,
                          quantity: 1,
                      })),
                  },
              ]
            : receiptItems.map((it) => ({
                  title: it.title,
                  unit_price: it.unitPrice,
                  quantity: it.quantity,
                  participants: it.participantIds.map((id) => ({
                      participant_id: id,
                      quantity: 1,
                  })),
              }));

        const totalAmount = items.reduce(
            (sum, it) => sum + it.unit_price * it.quantity,
            0,
        );

        const allParticipantIds = singleItem
            ? payer
            : [...new Set(receiptItems.flatMap((it) => it.participantIds))];

        const body = {
            payer_id: paidBy,
            title: expenseName,
            purchase_date: new Date().toISOString(),
            category: cashbackCategory || null,
            comment: '',
            image_url: null,
            is_confirmed: false,
            total_amount: totalAmount,
            participants: allParticipantIds.map((id) => ({
                participant_id: id,
            })),
            items,
        };

        try {
            const res = await fetch(
                `${API_BASE}/meetings/${meetingUuid}/participant/${paidBy}/receipts`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                },
            );

            if (!res.ok) {
                console.error('Ошибка сохранения:', await res.text());
                return;
            }

            const data = await res.json();
            onClose();
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
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: '#EAE0CD',
                        p: { xs: 2, sm: 3 },
                        borderRadius: fullScreen ? 0 : '20px',
                        visibility: receiptOpen ? 'hidden' : 'visible',
                    },
                },
                backdrop: {
                    sx: {
                        visibility: receiptOpen ? 'hidden' : 'visible',
                    },
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
                        fontSize: { xs: '1.5rem', sm: '1.875rem' },
                        letterSpacing: '0.02em',
                    }}
                >
                    Новый расход
                </Typography>
            </Box>

            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}
            >
                <TextField
                    fullWidth
                    label="Название расхода"
                    inputRef={nameRef}
                    sx={FIELD_SX}
                />
                {singleItem && (
                    <TextField
                        fullWidth
                        label="Сумма"
                        type="number"
                        inputRef={amountRef}
                        sx={FIELD_SX}
                    />
                )}

                {usersError && (
                    <Typography sx={{ color: '#d32f2f', fontSize: '0.875rem' }}>
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
                    slotProps={{
                        select: {
                            multiple: true,
                            MenuProps: MENU_PROPS,
                            renderValue: (selected) =>
                                usersOptions
                                    .filter((o) => selected.includes(o.value))
                                    .map((o) => o.label)
                                    .join(', '),
                        },
                    }}
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
                {!singleItem && (
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleReceiptView}
                        sx={{
                            border: '2px solid #463628',
                            color: '#463628',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            py: 1.5,
                        }}
                    >
                        ПОСМОТРЕТЬ ЧЕК
                    </Button>
                )}
                <FormControlLabel
                    control={
                        <Switch
                            checked={singleItem}
                            onChange={(e) => setSingleItem(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#DAB672',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                    {
                                        backgroundColor: '#DAB672',
                                    },
                            }}
                        />
                    }
                    label="Одна позиция"
                    sx={{
                        justifyContent: 'center',
                        ml: 0,
                        color: '#463628',
                        fontWeight: 600,
                        '& .MuiFormControlLabel-label': {
                            fontWeight: 600,
                        },
                    }}
                />
            </DialogContent>
            {!singleItem && (
                <Box className="px-6 pb-2 flex flex-col gap-3">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleReceiptUpload}
                        sx={{
                            backgroundColor: '#DAB672',
                            color: '#463628',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            py: 1.5,
                            fontSize: '1rem',
                            boxShadow: 'none',
                            '&:hover': { backgroundColor: '#c9a25f', boxShadow: 'none' },
                        }}
                    >
                        ОТСКАНИРОВАТЬ ЧЕК
                    </Button>
                </Box>
            )}
            <Box className="px-6 pb-4 flex flex-col gap-3">
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                        backgroundColor: '#463628',
                        color: '#F8F4EC',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        py: 1.5,
                        fontSize: '1rem',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#3a2c20', boxShadow: 'none' },
                    }}
                >
                    СОХРАНИТЬ РАСХОД
                </Button>
            </Box>
            <Receipt
                open={receiptOpen}
                onClose={() => setReceiptOpen(false)}
                items={receiptItems}
                setItems={setReceiptItems}
                usersOptions={usersOptions}
            />
        </Dialog>
    );
}
