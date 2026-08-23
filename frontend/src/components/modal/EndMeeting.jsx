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
                    className: '!bg-[#F7F1E3] !rounded-[32px] !p-6 !m-4 !max-w-[340px]',
                },
            }}
        >
            <Typography className="!font-bold !text-[#32281E] !text-xl !mb-8 !text-center">
                Уверены, что хотите завершить встречу?
            </Typography>

            <div className="flex gap-3">
                <Button
                    fullWidth
                    onClick={onConfirm}
                    className="!bg-[#32281E] !text-[#F8F4EC] !font-bold !rounded-2xl !py-3"
                >
                    Завершить
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
