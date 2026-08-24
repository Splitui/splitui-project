import { Dialog, Typography, Button } from '@mui/material';
import { useSnackbar } from '../SnackbarProvider';

export default function TransactionModal({ open, onClose, transaction, onConfirm }) {
    const showSnackbar = useSnackbar();
    if (!transaction) return null;
    const isPayment = transaction.action === 'оплата';

    const isLink = isPayment && !!transaction.bank_deeplink;

    const handleAction = () => {
        if (isPayment) {
            if (isLink) {
                showSnackbar('Открываем приложение банка...', 'info');
                setTimeout(onClose, 1000);
            } else {
                showSnackbar(
                    'Прямая ссылка недоступна. Используйте перевод по реквизитам.',
                    'warning',
                );
                onClose();
            }
        } else {
            onConfirm();
        }
    };

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    className: '!bg-[#F7F1E3] !rounded-[32px] !p-6 !m-4 !max-w-[340px]',
                },
            }}
        >
            <Typography className="!font-bold !text-[#32281E] !text-xl !mb-2 !text-left">
                {isPayment ? `Перевести ${transaction.name}?` : 'Подтвердить получение?'}
            </Typography>

            <Typography className="!text-[#463628] !opacity-70 !text-sm !mb-8">
                {isPayment
                    ? `Спишется ${transaction.amount.toLocaleString()} ₽. Вы уверены, что хотите оплатить пользователю ${transaction.name}.`
                    : `Вы подтверждаете, что получили ${transaction.amount.toLocaleString()} ₽ от ${transaction.name}.`}
            </Typography>

            <div className="flex gap-3">
                <Button
                    fullWidth
                    onClick={handleAction}
                    component={isLink ? 'a' : 'button'}
                    href={isLink ? transaction.bank_deeplink : undefined}
                    target={isLink ? '_blank' : undefined}

                    className="!bg-[#32281E] !text-[#F8F4EC] !font-bold !rounded-2xl !py-4 text-center"
                >
                    {isPayment ? `Перевести` : 'Подтвердить получение'}
                </Button>
                <Button
                    fullWidth
                    onClick={onClose}
                    className="!bg-[#FAF7F2] !text-[#463628] !font-bold !rounded-2xl !py-3"
                >
                    Отмена
                </Button>
            </div>
        </Dialog>
    );
}
