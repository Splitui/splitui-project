import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Button,
    Typography,
} from '@mui/material';
import TransactionModal from '../modal/TransactionModal';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL ?? '/api';
export default function PaymentTab() {
    const [payments, setPayments] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const meetingCookie = JSON.parse(Cookies.get('meeting') || '{}');
    const meetingId = meetingCookie.id;
    const sessionId = meetingCookie.sessionId;
    const myParticipantId = meetingCookie.participantId;

    const processDebts = (data) => {
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
                };
            });
        setPayments(myDebts);
    };

    const handleCalculate = async () => {
        try {
            const res = await fetch(`${API_URL}/meetings/${meetingId}/debts`, {
                method: 'POST',
                headers: { 'session-id': sessionId },
            });
            if (res.ok) {
                const data = await res.json();
                processDebts(data);
            }
        } catch (e) {
            console.error('Ошибка расчёта', e);
        }
    };

    useEffect(() => {
        const fetchDebts = async () => {
            if (!meetingId) return;
            try {
                const res = await fetch(`${API_URL}/meeting/${meetingId}/debts`);
                if (res.ok) {
                    const data = await res.json();
                    processDebts(data);
                }
            } catch (e) {
                console.error('Ошибка загрузки', e);
            }
        };
        fetchDebts();
    }, [meetingId, myParticipantId, sessionId]);

    const markDone = (id) => {
        setPayments((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isCompleted: true } : p)),
        );
        setSelectedTransaction(null);
    };

    return (
        <>
            {payments.length === 0 ? (
                <div className="bg-[#F8F4EC] rounded-[25px] p-10 text-center shadow-sm border border-dashed border-[#463628]/30">
                    <Typography className="!font-bold !text-[#463628] !text-lg !mb-4">
                        У вас пока нет долгов!
                    </Typography>
                    <Button
                        onClick={handleCalculate}
                        variant="contained"
                        className="!bg-[#463628] !text-[#F8F4EC] !rounded-xl !px-6 !py-2 !normal-case"
                    >
                        Рассчитать баланс
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4 px-2">
                        <Typography className="!text-[#463628] !font-bold !text-sm uppercase opacity-60">
                            Ваши расчеты
                        </Typography>
                        <Button
                            onClick={handleCalculate}
                            size="small"
                            className="!text-[#463628] !lowercase !font-bold"
                        >
                            обновить
                        </Button>
                    </div>

                    <TableContainer
                        component={Paper}
                        className="!rounded-[25px] !bg-[#F8F4EC] !shadow-none !overflow-hidden"
                    >
                        <Table>
                            <TableBody>
                                {payments.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell
                                            className={`!font-bold !text-[#463628] !border-b-[#F0F0F0] ${row.isCompleted ? '!opacity-40' : ''}`}
                                        >
                                            {row.name}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            onClick={() =>
                                                !row.isCompleted &&
                                                setSelectedTransaction(row)
                                            }
                                            className={`!font-bold !cursor-pointer !border-b-[#F0F0F0] 
                                                ${row.isCompleted ? '!line-through !text-gray-400' : row.action === 'получение' ? '!text-[#32935A]' : '!text-[#C12D2D]'}`}
                                        >
                                            {row.action}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            className={`!font-black !text-[#463628] !border-b-[#F0F0F0] ${row.isCompleted ? '!opacity-40' : ''}`}
                                        >
                                            {row.amount}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <TransactionModal
                open={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                onConfirm={() => markDone(selectedTransaction.id)}
            />
        </>
    );
}
