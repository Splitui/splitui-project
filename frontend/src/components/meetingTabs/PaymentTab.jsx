import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Typography, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Cookies from 'js-cookie';
import UserModal from '../modal/UserModal';
import TransactionModal from '../modal/TransactionModal';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function PaymentTab({ onUpdate, participants, refresh, roomStatus }) {
    const [payments, setPayments] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const showSnackbar = useSnackbar();

    const isLocked = roomStatus === 'done';

    const { meetingId, sessionId, myParticipantId } = useMemo(() => {
        const cookie = JSON.parse(Cookies.get('meeting') || '{}');
        return {
            meetingId: cookie.id,
            sessionId: cookie.sessionId,
            myParticipantId: cookie.participantId,
        };
    }, []);
    const processDebts = useCallback(
        (data) => {
            const myDebts = data
                .filter(
                    (debt) =>
                        debt.debtor_id === myParticipantId ||
                        debt.creditor_id === myParticipantId,
                )
                .map((debt) => {
                    const amIDebtor = debt.debtor_id === myParticipantId;
                    return {
                        id: debt.id,
                        name: amIDebtor ? debt.creditor_nickname : debt.debtor_nickname,
                        action: amIDebtor ? 'оплата' : 'получение',
                        amount: debt.amount,
                        isCompleted: debt.is_paid,
                        creditorId: debt.creditor_id,
                    };
                });
            setPayments(myDebts);
        },
        [myParticipantId],
    );

    const handleCalculate = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/meetings/${meetingId}/debts`, {
                method: 'POST',
                headers: { 'session-id': sessionId },
            });
            if (res.ok) {
                const data = await res.json();
                processDebts(data);
                showSnackbar('Расчет выполнен', 'success');
            } else {
                const errorData = await res.json().catch(() => ({}));
                showSnackbar(errorData.detail || 'Ошибка при расчете долгов');
            }
        } catch (e) {
            showSnackbar('Нет связи с сервером для расчета', e);
        }
    }, [meetingId, sessionId, processDebts, showSnackbar]);

    const fetchDebts = useCallback(
        async (forceRecalculate = false) => {
            if (!meetingId) return;
            try {
                const res = await fetch(`${API_URL}/meetings/${meetingId}/debts`, {
                    method: 'GET',
                    headers: { 'session-id': sessionId },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.length === 0 || forceRecalculate) {
                        await handleCalculate();
                    } else {
                        processDebts(data);
                    }
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    showSnackbar(errorData.detail || 'Не удалось получить список долгов');
                }
            } catch (e) {
                showSnackbar('Ошибка сети при загрузке долгов', e);
            }
        },
        [meetingId, handleCalculate, sessionId, processDebts, showSnackbar],
    );

    useEffect(() => {
        const loadData = async () => {
            await fetchDebts();
        };

        loadData();
    }, [fetchDebts, refresh]);

    const markDone = async (id) => {
        try {
            const res = await fetch(
                `${API_URL}/meetings/${meetingId}/debts/${id}/confirm`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'session-id': sessionId,
                    },
                    body: JSON.stringify({}),
                },
            );
            if (res.ok) {
                showSnackbar('Статус обновлен!', 'success');
                await fetchDebts();
                if (onUpdate) onUpdate();
            } else if (res.status === 400) {
                showSnackbar('Ошибка: действие невозможно');
            } else {
                const errorData = await res.json();
                showSnackbar(errorData.detail || 'Не удалось обновить статус');
            }
        } catch (e) {
            showSnackbar('Ошибка сети');
            console.error(e);
        } finally {
            setSelectedTransaction(null);
        }
    };

    const handleInitiatePayment = async (row) => {
        if (roomStatus === 'active') {
            showSnackbar("Погасить долг можно только в статусе встречи 'В расчёте'");
            return;
        }
        if (row.action === 'получение') {
            setSelectedTransaction(row);
            return;
        }
        try {
            const res = await fetch(
                `${API_URL}/meetings/${meetingId}/debts/${row.id}/payment`,
                {
                    headers: { 'session-id': sessionId },
                },
            );
            if (res.ok) {
                const payData = await res.json();
                setSelectedTransaction({
                    ...payData,
                    ...row,
                });
            } else {
                showSnackbar('У получателя не указаны банковские реквизиты');
            }
        } catch (e) {
            showSnackbar('Ошибка сети при получении данных оплаты', e);
        }
    };

    const handleGetRequisites = async (row) => {
        const url = `${API_URL}/meetings/${meetingId}/participants/${row.creditorId}/bank_data`;
        try {
            const res = await fetch(url, {
                headers: { 'session-id': sessionId },
            });
            if (res.ok) {
                const actualParticipant = participants?.find(
                    (p) => p.id === row.creditorId,
                );
                const data = await res.json();
                setViewingUser({
                    id: row.creditorId,
                    nickname: row.name,
                    card_number: data.card_number,
                    phone_number: data.phone_number,
                    bank_name: data.bank_name,
                    bank_id: data.bank_id,
                    is_creator: actualParticipant?.is_creator || false,
                });
            } else {
                showSnackbar('У этого участника не заполнены реквизиты');
            }
        } catch (e) {
            showSnackbar('Ошибка загрузки реквизитов', e);
        }
    };

    const allConfirmed = payments.length > 0 && payments.every((p) => p.isCompleted);
    const pendingCount = payments.filter((p) => !p.isCompleted).length;

    return (
        <div className="flex flex-col gap-4 mt-6">
            <div className="flex justify-between items-center px-2">
                <Typography className="!text-[11px] !font-bold !text-[#8A7C66] uppercase tracking-wider">
                    {allConfirmed
                        ? 'ВСЕ ПЕРЕВОДЫ ЗАКРЫТЫ'
                        : `${pendingCount} ПЕРЕВОДА ЗАКРОЮТ ВСТРЕЧУ`}
                </Typography>

                <Button
                    disabled={isLocked}
                    onClick={() => fetchDebts(true)}
                    className="!text-[11px] !font-bold !text-[#32281E] !bg-[#E8DFC7] !rounded-lg !px-2 !min-w-0"
                    size="small"
                    sx={{
                        '&.Mui-disabled': {
                            backgroundColor: '#F0EADF',
                            color: '#BDBDBD',
                            opacity: 0.6,
                        },
                    }}
                >
                    ПЕРЕСЧИТАТЬ
                </Button>
            </div>

            <div className="flex flex-col gap-3">
                {payments.map((row) => (
                    <div
                        key={row.id}
                        className={`p-4 rounded-[28px] border transition-all ${row.isCompleted ? 'bg-[#E7F0E5] border-[#D0E0CE]' : 'bg-white border-[#E8DFC7] shadow-sm'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: '#E6D9BA',
                                        color: '#7A5316',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {row.name[0].toUpperCase()}
                                </Avatar>
                                <Typography className="!font-bold !text-[#2E2519] !text-[15px]">
                                    {row.action === 'оплата' ? (
                                        <>Вы → {row.name}</>
                                    ) : (
                                        <>{row.name} → Вам</>
                                    )}
                                </Typography>
                            </div>
                            <Typography
                                className={`!font-black !text-[17px] ${row.isCompleted ? '!text-[#32935A]' : '!text-[#2E2519]'}`}
                            >
                                {row.amount.toLocaleString()} ₽
                            </Typography>
                        </div>

                        {row.isCompleted ? (
                            <div className="flex items-center gap-2 text-[#32935A]">
                                <CheckCircleIcon sx={{ fontSize: '18px' }} />
                                <Typography className="!text-[12px] !font-bold">
                                    {row.action === 'оплата'
                                        ? 'Вы оплатили'
                                        : 'Перевод подтверждён'}
                                </Typography>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    fullWidth
                                    onClick={() => handleInitiatePayment(row)}
                                    className="!bg-[#2E2519] !text-white !font-bold !rounded-xl !py-3"
                                >
                                    {row.action === 'оплата'
                                        ? 'Перевести'
                                        : 'Подтвердить получение'}
                                </Button>

                                {row.action === 'оплата' && (
                                    <Button
                                        onClick={() => handleGetRequisites(row)}
                                        className="!bg-[#E8DFC7] !text-[#2E2519] !font-bold !rounded-xl !px-5"
                                    >
                                        Реквизиты
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {allConfirmed && (
                    <div className="bg-[#E7F0E5] p-5 rounded-[28px] border border-[#D0E0CE] flex items-center gap-4 mt-2">
                        <CheckCircleIcon className="text-[#32935A]" />
                        <Typography className="!font-bold !text-[#32935A]">
                            Все переводы закрыты
                        </Typography>
                    </div>
                )}
            </div>

            <TransactionModal
                open={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                onConfirm={() => markDone(selectedTransaction.id)}
            />

            <UserModal
                open={!!viewingUser}
                onClose={() => setViewingUser(null)}
                user={viewingUser}
                meetingUUID={meetingId}
                participantId={viewingUser?.id}
                onSave={() => {}}
                isEditable={false}
                roomStatus="finished"
            />
        </div>
    );
}
