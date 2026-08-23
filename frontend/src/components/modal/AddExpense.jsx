import { Dialog, IconButton, Button, Typography, Box, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useEffect, useRef, useState, forwardRef } from 'react';
import Cookies from 'js-cookie';
import Receipt from './Receipt';
import { useSnackbar } from '../SnackbarProvider';
import QrScanner from './QrScanner';

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

export default function AddExpense({ open, onClose, onCreated }) {
    const nameRef = useRef(null);
    const amountRef = useRef(null);
    const showSnackbar = useSnackbar();

    const [paidBy, setPaidBy] = useState('');
    const [payer, setPayer] = useState([]);
    const [cashbackCategory, setCashbackCategory] = useState('');

    const [usersOptions, setUsersOptions] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [singleItem, setSingleItem] = useState(true);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receiptItems, setReceiptItems] = useState([]);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [cashbackOptions, setCashbackOptions] = useState([]);

    useEffect(() => {
        if (!open) return;

        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        const sessionId = meeting.sessionId;
        if (!meetingUuid) {
            const load = async () => {
                await setUsersError('Не найден UUID встречи');
            };
            load();
            return;
        }

        const controller = new AbortController();

        const fetchParticipants = async () => {
            setUsersLoading(true);
            setUsersError(null);
            try {
                const response = await fetch(
                    `${API_BASE}/meetings/${meetingUuid}/participants?limit=100&offset=0`,
                    {
                        signal: controller.signal,
                        headers: { 'session-id': sessionId },
                    },
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
                const catRes = await fetch(`${API_BASE}/cashback-categories`, {
                    signal: controller.signal,
                });
                if (catRes.ok) {
                    const cats = await catRes.json();
                    setCashbackOptions(cats.map((c) => ({ id: c.id, label: c.name })));
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setUsersError(err.message);
                    showSnackbar(err.message);
                }
            } finally {
                setUsersLoading(false);
            }
        };

        fetchParticipants();

        return () => controller.abort();
    }, [open, showSnackbar]);
    const togglePayer = (id) =>
        setPayer((prev) => {
            if (prev.includes(id)) {
                if (prev.length === 1) return prev;
                return prev.filter((x) => x !== id);
            }
            return [...prev, id];
        });

    const detailedTotal = receiptItems.reduce(
        (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
        0,
    );

    const handleQrScanned = async (qrRaw) => {
        setScannerOpen(false);
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        const sessionId = meeting.sessionId;
        try {
            const res = await fetch(`${API_BASE}/meetings/${meetingUuid}/receipts/qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'session-id': sessionId,
                },
                body: JSON.stringify({ qr_raw: qrRaw }),
            });
            if (!res.ok) {
                showSnackbar('Не удалось распознать чек');
                return;
            }
            onCreated?.();
            onClose();
            showSnackbar('Чек добавлен', 'success');
        } catch (e) {
            showSnackbar('Сеть недоступна', e);
        }
    };

    const handleSave = async () => {
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        const sessionId = meeting.sessionId;
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
            const res = await fetch(`${API_BASE}/meetings/${meetingUuid}/receipts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'session-id': sessionId,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.error('422:', await res.text());
                showSnackbar('Не удалось сохранить расход');
                return;
            }
            onCreated?.();
            onClose();
        } catch (e) {
            showSnackbar('Сеть недоступна', e);
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
                    Новый расход
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box
                        onClick={() => setScannerOpen(true)}
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '11px',
                            background: '#EBE1CB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <CameraAltIcon sx={{ fontSize: 18, color: '#5C5142' }} />
                    </Box>
                    <IconButton onClick={onClose} sx={{ color: '#9C8B6F', mr: -0.5 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
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
                {[
                    { key: true, label: 'Быстрый' },
                    { key: false, label: 'Детальный' },
                ].map((seg) => (
                    <Box
                        key={seg.label}
                        onClick={() => setSingleItem(seg.key)}
                        sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: 1,
                            borderRadius: '9px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: singleItem === seg.key ? '#2E2519' : '#8A7C66',
                            background:
                                singleItem === seg.key ? '#FFFDF7' : 'transparent',
                            boxShadow:
                                singleItem === seg.key
                                    ? '0 1px 3px rgba(46,37,25,.12)'
                                    : 'none',
                        }}
                    >
                        {seg.label}
                    </Box>
                ))}
            </Box>

            {singleItem ? (
                <Box sx={{ textAlign: 'center', pb: 2 }}>
                    <input
                        ref={amountRef}
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
                    ref={nameRef}
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

            <Box
                sx={{
                    ...cardSx,
                    mb: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                }}
            >
                <Typography
                    sx={{ fontSize: 12.5, color: '#8A7C66', width: 78, flexShrink: 0 }}
                >
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

            <Box
                sx={{
                    ...cardSx,
                    mb: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                }}
            >
                <Typography
                    sx={{ fontSize: 12.5, color: '#8A7C66', width: 78, flexShrink: 0 }}
                >
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
                <Box sx={{ ...cardSx, mb: 1.75 }}>
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
                    {receiptItems.length === 0 ? (
                        <Typography sx={{ fontSize: 12.5, color: '#A2947A', mt: 1 }}>
                            Пока пусто — нажмите, чтобы добавить позиции
                        </Typography>
                    ) : (
                        receiptItems.slice(0, 3).map((it) => (
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
                        ))
                    )}
                </Box>
            )}

            {usersError && (
                <Typography sx={{ color: '#d32f2f', fontSize: 13, mb: 1 }}>
                    {usersError}
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
                Сохранить расход
            </Button>

            <Receipt
                open={receiptOpen}
                onClose={() => setReceiptOpen(false)}
                items={receiptItems}
                setItems={setReceiptItems}
                usersOptions={usersOptions}
            />
            <QrScanner
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScanned={handleQrScanned}
            />
        </Dialog>
    );
}
