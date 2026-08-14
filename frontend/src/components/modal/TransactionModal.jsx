import { Dialog, Typography, Button } from '@mui/material';

export default function TransactionModal({ open, onClose, transaction }) {
    if (!transaction) return null;

    const isPayment = transaction.action === 'оплата';

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    className:
                        '!bg-[#F8F4EC] !rounded-[24px] !p-6 sm:!p-8 !m-4 !max-w-[420px]',
                },
            }}
        >
            <Typography className="!font-bold !text-[#463628] !text-[1.05rem] sm:!text-[1.15rem] !mb-8 !leading-snug !text-center">
                Уверены, что хотите {isPayment ? 'перевести' : 'уведомить'} пользовател
                {isPayment ? 'ю' : 'я'} {transaction.name} {isPayment ? '' : 'об оплате'}{' '}
                {transaction.amount} рублей?
            </Typography>

            <div className="flex gap-1.5 mb-1.5">
                <Button
                    fullWidth
                    onClick={onClose}
                    className="!bg-[#DAB672] !text-[#463628] !font-bold !rounded-xl !py-3 !text-sm sm:!text-base !shadow-none hover:!bg-[#c7a35f]"
                >
                    {isPayment ? 'ОПЛАТИТЬ' : 'УВЕДОМИТЬ'}
                </Button>
                <Button
                    fullWidth
                    onClick={onClose}
                    variant="outlined"
                    className="!border-[1px] !border-[#463628] !text-[#463628] !font-bold !rounded-xl !py-3 !text-sm sm:!text-base hover:!bg-[#463628]/5"
                >
                    ОТМЕНА
                </Button>
            </div>

            <Button
                fullWidth
                onClick={onClose}
                className="!bg-[#463628] !text-[#F8F4EC] !font-bold !rounded-xl !py-3 !text-sm sm:!text-base !shadow-none hover:!bg-[#3a2c20]"
            >
                {isPayment ? 'ОТПРАВИЛ' : 'ПОЛУЧИЛ'}
            </Button>
        </Dialog>
    );
}
