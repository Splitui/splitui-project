import {
    Dialog,
    DialogContent,
    IconButton,
    Button,
    Avatar,
    TextField,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { FIELD_SX } from './Options';
import { useRef } from 'react';

export default function UserModal({
    open,
    onClose,
    userName,
    onSave,
    isEditable = true,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const nameRef = useRef(null);
    const requisitesRef = useRef(null);

    const handleSave = () => {
        const data = {
            name: nameRef.current.value.trim(),
            requisites: requisitesRef.current.value.trim(),
        };
        onSave(data);
        onClose();
    };

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    className: '!bg-[#EAE0CD] rounded-[20px] p-4 sm:p-6 min-h-[500px]',
                },
            }}
        >
            <IconButton
                onClick={onClose}
                className="!absolute top-3 right-3 !text-[#463628]"
            >
                <CloseIcon />
            </IconButton>

            <div className="text-center pt-4 pb-2">
                <div className="font-extrabold text-[#463628] text-3xl">Мои данные</div>
            </div>

            <div className="flex justify-center pb-3">
                <Avatar className="!w-24 !h-24 !bg-[#C7BEB0]">
                    <PersonIcon className="!text-5xl !text-[#F8F4EC]" />
                </Avatar>
            </div>

            <DialogContent className="flex flex-col gap-6 py-6">
                <TextField
                    key={userName}
                    fullWidth
                    label="Имя пользователя"
                    defaultValue={userName}
                    inputRef={nameRef}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                />
                <TextField
                    fullWidth
                    label="Реквизиты"
                    inputRef={requisitesRef}
                    sx={FIELD_SX}
                    slotProps={{ input: { readOnly: !isEditable } }}
                />

                {isEditable && (
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClose}
                        className="!border-2 !border-[#463628] !text-[#463628] font-bold !rounded-xl py-3 hover:!bg-[#463628]"
                    >
                        МОИ КЭШБЕКИ
                    </Button>
                )}
            </DialogContent>

            {isEditable && (
                <div className="px-6 pb-2">
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSave}
                        className="!bg-[#463628] !text-[#F8F4EC] font-bold !rounded-xl py-3 !text-base !shadow-none hover:!bg-[#3a2c20]"
                    >
                        СОХРАНИТЬ
                    </Button>
                </div>
            )}
        </Dialog>
    );
}
