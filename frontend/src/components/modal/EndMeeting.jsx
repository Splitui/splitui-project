import { Dialog, Typography, Button } from '@mui/material';

export default function EndMeeting({ open, onClose, onConfirm }) {
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
            <Typography className="!font-bold !text-[#463628] !text-[1.1rem] sm:!text-[1.2rem] !mb-8 !leading-snug !text-center">
                Уверены, что хотите завершить встречу?
            </Typography>

            <div className="flex gap-4">
                <Button
                    fullWidth
                    onClick={onConfirm}
                    className="!bg-[#463628] !text-[#F8F4EC] !font-bold !rounded-xl !py-3 !text-sm sm:!text-base !shadow-none hover:!bg-[#3a2c20]"
                >
                    ЗАВЕРШИТЬ
                </Button>
                <Button
                    fullWidth
                    onClick={onClose}
                    className="!bg-[#DAB672] !text-[#463628] !font-bold !rounded-xl !py-3 !text-sm sm:!text-base !shadow-none hover:!bg-[#c7a35f]"
                >
                    ОТМЕНА
                </Button>
            </div>
        </Dialog>
    );
}
