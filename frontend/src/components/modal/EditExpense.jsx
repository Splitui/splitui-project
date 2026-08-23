import { Dialog, IconButton, Button, Typography, Box, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, forwardRef } from 'react';
import Cookies from 'js-cookie';
import Receipt from './Receipt';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';
const API_BASE = API_URL;

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const cardSx = {
    background: '#FFFDF7',
    border: '1px solid #E4D8BE',
    borderRadius: '13px',
    p: '12px 14px',
};

const nativeSelectStyle = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    fontSize: '14.5px',
    fontWeight: 600,
    color: '#2E2519',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
};

export default function EditExpense({ open, onClose, onUpdated, expenseId }) {
    const showSnackbar = useSnackbar();
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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cashbackOptions, setCashbackOptions] = useState([]);

    useEffect(() => {
        if (!open || !expenseId) return;

        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        const sessionId = meeting.sessionId;
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
                    { signal: controller.signal, headers: { 'session-id': sessionId } },
                );
                if (!partRes.ok) throw new Error(`Ошибка участников: ${partRes.status}`);
                const partData = await partRes.json();
                setUsersOptions(
                    partData.map((p) => ({ value: p.id, label: p.nickname })),
                );
                const catRes = await fetch(`${API_BASE}/cashback-categories`, {
                    signal: controller.signal,
                });
                if (catRes.ok) {
                    const cats = await catRes.json();
                    setCashbackOptions(cats.map((c) => ({ id: c.id, label: c.name }))); 
                }
                const recRes = await fetch(
                    `${API_BASE}/meetings/${meetingUuid}/receipts/${expenseId}?limit=100&offset=0`,
                    { signal: controller.signal, headers: { 'session-id': sessionId } },
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
                            participantIds: (it.participants || []).map((p) => p.id),
                        })),
                    );
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    showSnackbar(err.message);
                }
            } finally {
                setUsersLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [open, expenseId]);

    const togglePayer = (id) =>
        setPayer((prev) => {
            if (prev.includes(id)) {
                if (prev.length === 1) return prev; // последнего убрать нельзя
                return prev.filter((x) => x !== id);
            }
            return [...prev, id];
        });

    const detailedTotal = receiptItems.reduce(
        (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
        0,
    );

    const handleSave = async () => {
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        const sessionId = meeting.sessionId;
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
            const res = await fetch(`${API_BASE}/meetings/${meetingUuid}/receipts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'session-id': sessionId,
                },
                body: JSON.stringify(body),
            });
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

    const doDelete = async () => {
        setConfirmOpen(false);
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        const sessionId = meeting.sessionId;
        if (!meetingUuid || !expenseId) return;
        try {
            const res = await fetch(
                `${API_BASE}/meetings/${meetingUuid}/receipts/${expenseId}`,
                { method: 'DELETE', headers: { 'session-id': sessionId } },
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
            open={open}
            onClose={onClose}
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
                        visibility: receiptOpen ? 'hidden' : 'visible',
                    },
                },
                backdrop: { sx: { visibility: receiptOpen ? 'hidden' : 'visible' } },
            }}
        >
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
                    alignItems: 'center',
                    mb: 1.75,
                }}
            >
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#2E2519' }}>
                    Редактирование расхода
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#9C8B6F', mr: -0.5 }}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: '4px',
                    p: '4px',
                    background: '#E8DFC7',
                    borderRadius: '12px',
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 1,
                        borderRadius: '9px',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#2E2519',
                        background: '#FFFDF7',
                        boxShadow: '0 1px 3px rgba(46,37,25,.12)',
                    }}
                >
                    {singleItem ? 'Быстрый' : 'Детальный'}
                </Box>
            </Box>
            {singleItem ? (
                <Box sx={{ textAlign: 'center', pb: 2 }}>
                    <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        style={{
                            width: '100%',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'center',
                            fontSize: 44,
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: '#2E2519',
                            outline: 'none',
                            fontFamily: 'inherit',
                        }}
                    />
                    <Box
                        sx={{
                            height: '2px',
                            width: 150,
                            mx: 'auto',
                            mt: 0.75,
                            background: '#C9A55F',
                        }}
                    />
                    <Typography sx={{ fontSize: 12, color: '#8A7C66', mt: 1 }}>
                        Введите итоговую сумму
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', pb: 2 }}>
                    <Typography
                        sx={{
                            fontSize: 44,
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: '#2E2519',
                        }}
                    >
                        {detailedTotal}
                        <span style={{ color: '#B5A78C' }}>&nbsp;₽</span>
                    </Typography>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            mt: 1.25,
                            px: 1.4,
                            py: 0.6,
                            borderRadius: '8px',
                            background: '#EFE6CF',
                            fontSize: 12,
                            color: '#7C6E58',
                        }}
                    >
                        🔒 Сумма из {receiptItems.length} позиций
                    </Box>
                </Box>
            )}
            <Box
                sx={{
                    ...cardSx,
                    mb: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <span style={{ fontSize: 18 }}>🧾</span>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Название расхода"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        border: 'none',
                        background: 'transparent',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#2E2519',
                        outline: 'none',
                        fontFamily: 'inherit',
                    }}
                />
            </Box>
            <Box sx={{ ...cardSx, mb: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Typography sx={{ fontSize: 12.5, color: '#8A7C66', width: 78, flexShrink: 0 }}>
                    Платил
                </Typography>
                <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(Number(e.target.value))}
                    disabled={usersLoading}
                    style={nativeSelectStyle}
                >
                    <option value="" disabled>
                        Выберите
                    </option>
                    {usersOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <span style={{ color: '#B5A78C', flexShrink: 0 }}>▾</span>
            </Box>
            <Box sx={{ ...cardSx, mb: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Typography sx={{ fontSize: 12.5, color: '#8A7C66', width: 78, flexShrink: 0 }}>
                    Категория
                </Typography>
                <select
                    value={cashbackCategory}
                    onChange={(e) => setCashbackCategory(e.target.value)}
                    style={nativeSelectStyle}
                >
                    <option value="" disabled>
                        Выберите
                    </option>
                    {cashbackOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <span style={{ color: '#B5A78C', flexShrink: 0 }}>▾</span>
            </Box>
            {singleItem && (
                <Box sx={{ ...cardSx, mb: 1.75, p: '13px 14px' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1.4,
                        }}
                    >
                        <Typography sx={{ fontSize: 12.5, color: '#8A7C66' }}>
                            На кого делим
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: '#7A5316',
                                background: '#F1E4C6',
                                px: 1.1,
                                py: 0.4,
                                borderRadius: '8px',
                            }}
                        >
                            {payer.length} чел.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {usersOptions.map((o) => {
                            const active = payer.includes(o.value);
                            return (
                                <Box
                                    key={o.value}
                                    onClick={() => togglePayer(o.value)}
                                    sx={{
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        width: 52,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mx: 'auto',
                                            borderRadius: '50%',
                                            background: '#E6D9BA',
                                            color: '#7A5316',
                                            border: active
                                                ? '2px solid #2E2519'
                                                : '2px solid transparent',
                                            opacity: active ? 1 : 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 14,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {o.label?.[0]?.toUpperCase()}
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontSize: 10.5,
                                            color: '#8A7C66',
                                            mt: 0.6,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {o.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: '#8A7C66',
                            mt: 1.4,
                            pt: 1.25,
                            borderTop: '1px solid #EAE0C8',
                            lineHeight: 1.45,
                        }}
                    >
                        Нажмите на участника, чтобы включить или исключить его из деления.
                    </Typography>
                </Box>
            )}
            {!singleItem && (
                <Box
                    onClick={() => setReceiptOpen(true)}
                    sx={{ ...cardSx, mb: 1.75, cursor: 'pointer' }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography
                            sx={{ fontSize: 14, fontWeight: 600, color: '#2E2519' }}
                        >
                            Позиции чека
                        </Typography>
                        <Typography
                            sx={{ fontSize: 12.5, color: '#8A5B12', fontWeight: 600 }}
                        >
                            Редактировать ›
                        </Typography>
                    </Box>
                    {receiptItems.slice(0, 3).map((it) => (
                        <Box
                            key={it.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 12.5,
                                color: '#7C6E58',
                                mt: 1,
                            }}
                        >
                            <span>{it.title}</span>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {Number(it.unitPrice) * Number(it.quantity)} ₽
                            </span>
                        </Box>
                    ))}
                    {receiptItems.length > 3 && (
                        <Typography sx={{ fontSize: 12, color: '#A2947A', mt: 0.9 }}>
                            и ещё {receiptItems.length - 3} позиции
                        </Typography>
                    )}
                </Box>
            )}

            {error && (
                <Typography sx={{ color: '#d32f2f', fontSize: 13, mb: 1 }}>
                    {error}
                </Typography>
            )}
            <Button
                fullWidth
                onClick={handleSave}
                sx={{
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
            <Button
                fullWidth
                onClick={() => setConfirmOpen(true)}
                sx={{
                    mt: 1.25,
                    py: 1.5,
                    borderRadius: '14px',
                    color: '#8A5B12',
                    fontSize: 15,
                    fontWeight: 600,
                    textTransform: 'none',
                }}
            >
                Удалить расход
            </Button>
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '18px',
                            backgroundColor: '#F7F1E3',
                            maxWidth: 320,
                            width: '85%',
                        },
                    },
                }}
            >
                <Box sx={{ p: 2.5 }}>
                    <Typography
                        sx={{ fontSize: 16, fontWeight: 600, color: '#2E2519', mb: 2 }}
                    >
                        Удалить этот расход?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            fullWidth
                            onClick={() => setConfirmOpen(false)}
                            sx={{
                                py: 1.25,
                                borderRadius: '12px',
                                border: '1px solid #C3B394',
                                color: '#2E2519',
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            fullWidth
                            onClick={doDelete}
                            sx={{
                                py: 1.25,
                                borderRadius: '12px',
                                backgroundColor: '#2E2519',
                                color: '#F7F1E3',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: '#3a2c20',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            Удалить
                        </Button>
                    </Box>
                </Box>
            </Dialog>

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
