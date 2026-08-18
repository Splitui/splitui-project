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
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { CASHBACK_OPTIONS, FIELD_SX, MENU_PROPS } from '../Options';
import Receipt from './Receipt';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_BASE = API_URL;

export default function EditExpense({ open, onClose, onUpdated, expenseId }) {
    const showSnackbar = useSnackbar();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [payer, setPayer] = useState([]);
    const [cashbackCategory, setCashbackCategory] = useState('');
    const [singleItem, setSingleItem] = useState(true);

    const [usersOptions, setUsersOptions] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receiptItems, setReceiptItems] = useState([]);

    useEffect(() => {
        if (!open || !expenseId) return;

        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        if (!meetingUuid) {
            setError('Не найден UUID встречи');
            return;
        }

        const controller = new AbortController();

        const load = async () => {
            setUsersLoading(true);
            setError(null);
            try {
                const partRes = await fetch(
                    `${API_BASE}/meetings/${meetingUuid}/participants?limit=100&offset=0`,
                    { signal: controller.signal },
                );
                if (!partRes.ok) throw new Error(`Ошибка участников: ${partRes.status}`);
                const partData = await partRes.json();
                setUsersOptions(
                    partData.map((p) => ({ value: p.id, label: p.nickname })),
                );
                const recRes = await fetch(
                    `${API_BASE}/meetings/${meetingUuid}/receipts/${expenseId}?limit=100&offset=0`,
                    { signal: controller.signal },
                );
                if (!recRes.ok) throw new Error(`Ошибка чека: ${recRes.status}`);
                const rec = await recRes.json();
                setTitle(rec.title || '');
                setPaidBy(rec.payer_id || '');
                setCashbackCategory(rec.category ?? '');

                const items = rec.items || [];
                if (items.length <= 1) {
                    setSingleItem(true);
                    setAmount(items[0]?.unit_price ?? '');
                    setPayer((items[0]?.participants || []).map((p) => p.id));
                    setReceiptItems([]);
                } else {
                    setSingleItem(false);
                    setReceiptItems(
                        items.map((it) => ({
                            id: it.id,
                            title: it.title,
                            unitPrice: it.unit_price,
                            quantity: it.quantity,
                            participantIds: (it.participants || []).map(
                                (p) => p.participant_id,
                            ),
                        })),
                    );
                }
            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message);
                showSnackbar(err.message);
            } finally {
                setUsersLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [open, expenseId]);

    const handleReceiptView = () => setReceiptOpen(true);

    const handleSave = async () => {
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        if (!meetingUuid || !paidBy) return;

        const items = singleItem
            ? [
                  {
                      title,
                      unit_price: parseFloat(amount) || 0,
                      quantity: 1,
                      participants: payer
                          .filter((id) => id != null)
                          .map((id) => ({ participant_id: id, quantity: 1 })),
                  },
              ]
            : receiptItems.map((it) => ({
                  title: it.title,
                  unit_price: it.unitPrice,
                  quantity: it.quantity,
                  participants: it.participantIds
                      .filter((id) => id != null)
                      .map((id) => ({ participant_id: id, quantity: 1 })),
              }));

        const totalAmount = items.reduce(
            (sum, it) => sum + it.unit_price * it.quantity,
            0,
        );

        const allParticipantIds = singleItem
            ? payer.filter((id) => id != null)
            : [...new Set(receiptItems.flatMap((it) => it.participantIds))].filter(
                  (id) => id != null,
              );

        const body = {
            id: expenseId,
            payer_id: paidBy,
            title,
            purchase_date: new Date().toISOString(),
            category: cashbackCategory || null,
            comment: '',
            image_url: null,
            is_confirmed: false,
            total_amount: totalAmount,
            participants: allParticipantIds.map((id) => ({ participant_id: id })),
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
                showSnackbar('Не удалось обновить расход');
                return;
            }
            onUpdated?.();
            onClose();
        } catch (e) {
            showSnackbar('Сеть недоступна');
        }
    };
    const handleDelete = async () => {
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        if (!meetingUuid || !expenseId) return;
        if (!window.confirm('Удалить этот расход?')) return;

        try {
            const res = await fetch(
                `${API_BASE}/meetings/${meetingUuid}/participant/${paidBy}/receipts/${expenseId}`,
                { method: 'DELETE' },
            );
            if (!res.ok) {
                showSnackbar('Не удалось удалить расход');
                return;
            }
            onUpdated?.();
            onClose();
        } catch (e) {
            showSnackbar('Сеть недоступна');
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
                    sx: { visibility: receiptOpen ? 'hidden' : 'visible' },
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
                    Редактирование расхода
                </Typography>
            </Box>

            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}
            >
                <TextField
                    fullWidth
                    label="Название расхода"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={FIELD_SX}
                />
                {singleItem && (
                    <TextField
                        fullWidth
                        label="Сумма"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        sx={FIELD_SX}
                    />
                )}

                {error && (
                    <Typography sx={{ color: '#d32f2f', fontSize: '0.875rem' }}>
                        {error}
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
                        <MenuItem key={option.id} value={option.id}>
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
                                    { backgroundColor: '#DAB672' },
                            }}
                        />
                    }
                    label="Одна позиция"
                    sx={{
                        justifyContent: 'center',
                        ml: 0,
                        color: '#463628',
                        fontWeight: 600,
                        '& .MuiFormControlLabel-label': { fontWeight: 600 },
                    }}
                />
            </DialogContent>

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
                    СОХРАНИТЬ ИЗМЕНЕНИЯ
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleDelete}
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
                    УДАЛИТЬ РАСХОД
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
