import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
} from '@mui/material';
// import Dialog from '@mui/material/Dialog';

const PAYMENTS = [
    { id: 1, name: 'Вивальди', action: 'получение', amount: '5648,67' },
    { id: 2, name: 'Моцарт', action: 'оплата', amount: '5153,00' },
    { id: 3, name: 'Галилео', action: 'получение', amount: '1200,00' },
    { id: 4, name: 'Канеки', action: 'оплата', amount: '340,00' },
    { id: 5, name: 'Юзер', action: 'оплата', amount: '150,00' },
];

export default function PaymentTab() {
    {
        /*
    const [isOpen, setIsOpen] = useState(false);

    const handleClickOpen = () => {
        setIsOpen(true);
    };

    const handleClickClose = () => {
        setIsOpen(false);
    };
    */
    }

    return (
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
                    {PAYMENTS.map((row) => (
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
                                {row.name}
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    color:
                                        row.action === 'получение'
                                            ? '#32935ADE'
                                            : '#C12D2DDE',
                                    borderBottom: '1px solid #F0F0F0',
                                    py: 2.5,
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
    );
}
{
    /*
                <Dialog fullScreen open={isOpen} onClose={handleClickClose}>
                    <div className="p-4">
                        <button
                            onClick={handleClickClose}
                            className="flex font-bold text-lg mb-4 ml-auto"
                        >
                            ☓
                        </button>
                        <h2 className="text-2xl font-bold">Наш чек</h2>
                        <p className="mt-4">Когда-нибудь здесь появятся долговики...</p>
                    </div>
                </Dialog>
                */
}
