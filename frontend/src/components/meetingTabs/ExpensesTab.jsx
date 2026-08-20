import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Box,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';
const API_BASE = API_URL;

export default function ExpensesTab({ refresh, onExpenseClick }) {
    const showSnackbar = useSnackbar();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const meeting = JSON.parse(Cookies.get('meeting') || '{}');
        const meetingUuid = meeting.id;
        if (!meetingUuid) {
            setError('Не найден UUID встречи');
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
                        headers: { 'session-id': meeting.sessionId },
                    },
                );

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки расходов: ${response.status}`);
                }

                const data = await response.json();
                setExpenses(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    showSnackbar(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();

        return () => controller.abort();
    }, [refresh]);

    return (
        <Box sx={{ p: 2 }}>
            {error && (
                <Typography sx={{ color: '#d32f2f', fontSize: '0.875rem', mb: 2 }}>
                    {error}
                </Typography>
            )}
            {!loading && !error && expenses.length === 0 ? (
                <Typography
                    sx={{
                        textAlign: 'center',
                        color: '#463628',
                        opacity: 0.6,
                        py: 4,
                    }}
                >
                    Нет расходов
                </Typography>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: '25px',
                        bgcolor: '#F8F4EC',
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        maxHeight: 260,
                        overflowY: 'auto',
                    }}
                >
                    <Table stickyHeader={false}>
                        <TableBody>
                            {expenses.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => onExpenseClick?.(row.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 },
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#463628',
                                            fontSize: '1rem',
                                            borderBottom: '1px solid #F0F0F0',
                                            py: 2.5,
                                        }}
                                    >
                                        {row.title}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{
                                            fontWeight: '900',
                                            color: '#463628',
                                            fontSize: '1rem',
                                            borderBottom: '1px solid #F0F0F0',
                                            py: 2.5,
                                        }}
                                    >
                                        {row.total_amount}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
