import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';
const API_BASE = API_URL;

const CATEGORY_ICONS = {
    supermarkets: '🛒',
    gas: '⛽',
    transport: '🚕',
    entertainment: '🎭',
};

const DEFAULT_ICON = '🧾';

const formatAmount = (value) => {
    const amount = Number(value) || 0;
    const hasCents = Math.round(amount * 100) % 100 !== 0;

    return amount.toLocaleString('ru-RU', {
        minimumFractionDigits: hasCents ? 2 : 0,
        maximumFractionDigits: 2,
    });
};

const formatDay = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Без даты';

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};

const expenseDate = (expense) => expense.purchase_date ?? expense.created_at;

const dayKey = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'unknown';

    return date.toLocaleDateString('sv-SE');
};

const groupByDay = (expenses) => {
    const groups = new Map();

    [...expenses]
        .sort((a, b) => {
            const dateDiff = new Date(expenseDate(a)) - new Date(expenseDate(b));
            return dateDiff || a.id - b.id;
        })
        .forEach((expense) => {
            const date = expenseDate(expense);
            const key = dayKey(date);
            if (!groups.has(key)) groups.set(key, { date, items: [] });
            groups.get(key).items.push(expense);
        });

    return [...groups.entries()].map(([key, group]) => ({ key, ...group })).reverse();
};

export default function ExpensesTab({
    refresh,
    onExpenseClick,
    participants = [],
    participantId,
}) {
    const showSnackbar = useSnackbar();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const meeting = JSON.parse(Cookies.get('meeting') || '{}');
    const meetingUuid = meeting.id;
    const sessionId = meeting.sessionId;

    useEffect(() => {
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        if (!meetingUuid) {
            const loadError = async () => {
                await setError('Не найден UUID встречи');
            };
            loadError();
            return;
        }

        const controller = new AbortController();

        const fetchExpenses = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_BASE}/meetings/${meetingUuid}/receipts?limit=100&offset=0`,
                    {
                        signal: controller.signal,
                        headers: { 'session-id': sessionId },
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage =
                        errorData.detail || `Ошибка сервера: ${response.status}`;
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                setExpenses(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    showSnackbar(err.message, 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();

        return () => controller.abort();
    }, [refresh, meetingUuid, sessionId, showSnackbar]);

    const groups = useMemo(() => groupByDay(expenses), [expenses]);

    const totals = useMemo(() => {
        const spent = expenses.reduce(
            (sum, expense) => sum + (Number(expense.total_amount) || 0),
            0,
        );
        const cashback = expenses.reduce(
            (sum, expense) => sum + (Number(expense.cashback_amount) || 0),
            0,
        );

        return {
            spent,
            cashback,
            perPerson: participants.length ? spent / participants.length : 0,
        };
    }, [expenses, participants.length]);

    const payerName = (payerId) => {
        if (payerId === participantId) return 'Вы';
        return (
            participants.find((participant) => participant.id === payerId)?.nickname ??
            'Участник'
        );
    };

    if (!meetingUuid || error) {
        return (
            <p className="m-0 px-[6px] py-4 text-[13px] text-[#A8562F]">
                {error ?? 'Не найден UUID встречи'}
            </p>
        );
    }

    if (loading && expenses.length === 0) {
        return (
            <p className="m-0 py-8 text-center text-[13px] text-[#8A7C66]">Загрузка…</p>
        );
    }

    if (expenses.length === 0) {
        return (
            <p className="m-0 py-8 text-center text-[13px] text-[#8A7C66]">
                Пока нет расходов
            </p>
        );
    }

    return (
        <div className="px-[6px] pb-4">
            {groups.map((group) => (
                <div key={group.key}>
                    <div className="pt-[18px] pb-1.5 text-[11.5px] uppercase tracking-[0.08em] text-[#A2947A]">
                        {formatDay(group.date)}
                    </div>

                    {group.items.map((expense, index) => (
                        <div key={expense.id}>
                            <div
                                onClick={() => onExpenseClick?.(expense.id)}
                                className="flex items-center gap-3 py-[11px] cursor-pointer"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#EBE1CB] flex items-center justify-center text-[18px]">
                                    {CATEGORY_ICONS[expense.category] ?? DEFAULT_ICON}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-[15px] font-semibold text-[#2E2519] truncate">
                                        {expense.title}
                                    </div>
                                    <div className="mt-0.5 text-[12px] text-[#8A7C66] truncate">
                                        {payerName(expense.payer_id)}
                                    </div>
                                </div>

                                <div className="shrink-0 text-[15px] font-semibold text-[#2E2519] tabular-nums">
                                    {formatAmount(expense.total_amount)} ₽
                                </div>
                            </div>

                            {index < group.items.length - 1 && (
                                <div className="h-px bg-[#E2D6BC] ml-[52px]" />
                            )}
                        </div>
                    ))}
                </div>
            ))}

            <div className="mt-[18px] p-[15px] rounded-[14px] bg-[#EFE6CF]">
                <div className="flex justify-between gap-3 mb-2.5">
                    <div>
                        <div className="text-[12px] text-[#8A7C66]">Всего потрачено</div>
                        <div className="mt-0.5 text-[17px] font-semibold text-[#2E2519] tabular-nums">
                            {formatAmount(totals.spent)} ₽
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[12px] text-[#8A7C66]">На человека</div>
                        <div className="mt-0.5 text-[17px] font-semibold text-[#2E2519] tabular-nums">
                            {formatAmount(totals.perPerson)} ₽
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[#E0D3B7] my-2.5" />

                <div className="flex justify-between items-center gap-3">
                    <span className="text-[12.5px] text-[#7C6E58]">
                        💳 Сэкономлено на кешбэках
                    </span>
                    <span className="text-[16px] font-bold text-[#3F7A3A] tabular-nums">
                        {formatAmount(totals.cashback)} ₽
                    </span>
                </div>
            </div>
        </div>
    );
}
