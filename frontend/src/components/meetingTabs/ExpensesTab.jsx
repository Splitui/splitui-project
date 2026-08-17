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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_BASE = API_URL;

export default function ExpensesTab() {
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
                    { signal: controller.signal },
                );

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки расходов: ${response.status}`);
                }

                const data = await response.json();
                setExpenses(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();

        return () => controller.abort();
    }, []);

    return (
        <Box sx={{ p: 2 }}>
            {error && (
                <Typography sx={{ color: '#d32f2f', fontSize: '0.875rem', mb: 2 }}>
                    {error}
                </Typography>
            )}

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
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
        </Box>
    );
}