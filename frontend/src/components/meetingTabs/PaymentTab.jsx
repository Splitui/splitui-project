import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
} from '@mui/material';
import TransactionModal from '../modal/TransactionModal';
import { useState } from 'react';
import { PAYMENTS } from '../Options';

export default function PaymentTab() {
    const [payments, setPayments] = useState(PAYMENTS);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const handleActionClick = (row) => {
        setSelectedTransaction(row);
    };

    const handleCloseTransaction = () => {
        setSelectedTransaction(null);
    };

    const markDone = (id) => {
        setPayments((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isCompleted: true } : p)),
        );
        handleCloseTransaction();
    };

    return (
        <>
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '25px',
                    bgcolor: '#F8F4EC',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                }}
            >
                <Table>
                    <TableBody>
                        {payments.map((row) => (
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
                                        opacity: row.isCompleted ? 0.5 : 1,
                                    }}
                                >
                                    {row.name}
                                </TableCell>

                                <TableCell
                                    align="center"
                                    onClick={() => handleActionClick(row)}
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem',
                                        cursor: row.isCompleted ? 'default' : 'pointer',
                                        textDecoration: row.isCompleted
                                            ? 'line-through'
                                            : 'none',
                                        color:
                                            row.action === 'получение'
                                                ? '#32935ADE'
                                                : '#C12D2DDE',
                                        borderBottom: '1px solid #F0F0F0',
                                        pointerEvents: row.isCompleted ? 'none' : 'auto',
                                        py: 2.5,
                                        '&:hover': {
                                            opacity: 0.7,
                                        },
                                    }}
                                >
                                    {row.action}
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: '900',
                                        color: '#463628',
                                        fontSize: '1rem',
                                        borderBottom: '1px solid #F0F0F0',
                                        opacity: row.isCompleted ? 0.5 : 1,
                                        py: 2.5,
                                    }}
                                >
                                    {row.amount}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TransactionModal
                open={!!selectedTransaction}
                onClose={handleCloseTransaction}
                transaction={selectedTransaction}
                onConfirm={() => markDone(selectedTransaction.id)}
            />
        </>
    );
}
