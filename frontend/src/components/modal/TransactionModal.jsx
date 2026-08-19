import { Dialog, Typography, Button } from '@mui/material';

export default function TransactionModal({ open, onClose, transaction, onConfirm }) {
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

            <div className="flex flex-col gap-3">
                {isPayment ? (
                    <div className="flex gap-2">
                        <Button
                            fullWidth
                            onClick={onClose}
                            className="!bg-[#DAB672] !text-[#463628] !font-bold !rounded-xl !py-3 !text-sm sm:!text-base !shadow-none hover:!bg-[#c7a35f]"
                        >
                            Оплатить
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
                ) : (
                    <>
                        <div className="flex gap-2">
                            <Button
                                fullWidth
                                onClick={onConfirm}
                                className="!bg-[#DAB672] !text-[#463628] !font-bold !rounded-xl !py-3 !text-sm sm:!text-base !shadow-none hover:!bg-[#c7a35f]"
                            >
                                ПОЛУЧИЛ
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
                    </>
                )}
            </div>
        </Dialog>
    );
}
