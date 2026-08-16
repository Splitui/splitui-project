import { useState } from 'react';
import { CASHBACK_OPTIONS } from '../Options';
import { Button, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function CashbackModal({ open, onClose, onSave }) {
    const [cashbacks, setCashbacks] = useState(CASHBACK_OPTIONS);

    const handleAmountChange = (id, delta) => {
        setCashbacks((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const value = Math.max(0, Math.min(100, item.value + delta));
                    return { ...item, value: value };
                }
                return item;
            }),
        );
    };

    const handleSave = () => {
        alert('Кэшбеки сохранены');
        if (onSave) onSave(cashbacks);
    };

    const controlBtnClass =
        '!min-w-[44px] !w-[44px] !h-[36px] !bg-[#463628] !text-[#F8F4EC] !rounded-lg !text-xl !font-bold !p-0 !shadow-none hover:!bg-[#3a2c20]';

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    className:
                        '!bg-[#F8F4EC] !rounded-[24px] !p-4 sm:!p-6 !m-4 !max-h-[85vh]',
                },
            }}
        >
            <IconButton
                onClick={onClose}
                className="!absolute !top-3 !right-3 !text-[#463628]"
            >
                <CloseIcon />
            </IconButton>

            <div className="text-center pt-4 pb-2">
                <Typography className="!font-black !text-[#463628] !text-2xl tracking-wide uppercase">
                    Мои кэшбэки
                </Typography>
            </div>

            <DialogContent
                className="!flex !flex-col !gap-6 !px-2 !pb-4
                [&::-webkit-scrollbar]:!w-[6px] 
                [&::-webkit-scrollbar-track]:!bg-[#EAE0CD] [&::-webkit-scrollbar-track]:!rounded-[10px] 
                [&::-webkit-scrollbar-thumb]:!bg-[#463628] [&::-webkit-scrollbar-thumb]:!rounded-[10px]"
            >
                {cashbacks.map((item) => (
                    <div key={item.id} className="flex flex-col items-center gap-2">
                        <Typography className="!font-extrabold !text-[#463628] !text-base tracking-widest uppercase">
                            {item.label}
                        </Typography>

                        <div className="flex items-center justify-center gap-4 w-full">
                            <Button
                                variant="contained"
                                className={controlBtnClass}
                                onClick={() => handleAmountChange(item.id, -1)}
                            >
                                -
                            </Button>
                            <Typography className="!font-black !text-[#463628] !text-[2.5rem] !w-[80px] text-center leading-none">
                                {item.value}%
                            </Typography>

                            <Button
                                variant="contained"
                                className={controlBtnClass}
                                onClick={() => handleAmountChange(item.id, 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                ))}
            </DialogContent>

            <div className="pt-4 px-2">
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSave}
                    className="!bg-[#463628] !text-[#F8F4EC] !font-bold !rounded-xl !py-3 !text-base !shadow-none hover:!bg-[#3a2c20]"
                >
                    СОХРАНИТЬ
                </Button>
            </div>
        </Dialog>
    );
}
