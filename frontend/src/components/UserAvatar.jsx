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
import { useRef, useState } from 'react';

export default function UserAvatar({ userName }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isOpen, setIsOpen] = useState(false);
    const firstLetterUserName = userName?.charAt(0).toUpperCase() || 'Ю';
    const nameRef = useRef(null);
    const requisitesRef = useRef(null);
    const handleClickOpen = () => {
        setIsOpen(true);
    };

    const handleClickClose = () => {
        setIsOpen(false);
    };
    const handleCashbacks = () => {};

    const handleSave = () => {
        console.log({
            name: nameRef.current.value.trim(),
            requisites: requisitesRef.current.value.trim(),
        });
        handleClickClose();
    };
    return (
        <div>
            <Avatar onClick={handleClickOpen} className="font-bold bg-black">
                {firstLetterUserName}
            </Avatar>

            <Dialog
                fullScreen={isMobile}
                fullWidth
                maxWidth="xs"
                open={isOpen}
                onClose={handleClickClose}
                slotProps={{
                    paper: {
                        className:
                            '!bg-[#EAE0CD] rounded-[20px] p-4 sm:p-6 min-h-[500px]',
                    },
                }}
            >
                <IconButton
                    onClick={handleClickClose}
                    className="!absolute top-3 right-3 !text-[#463628]"
                >
                    <CloseIcon />
                </IconButton>

                <div className="text-center pt-4 pb-2">
                    <div className="font-extrabold text-[#463628] text-3xl">
                        Мои данные
                    </div>
                </div>

                <div className="flex justify-center pb-3">
                    <Avatar className="!w-24 !h-24 !bg-[#C7BEB0]">
                        <PersonIcon className="!text-5xl !text-[#F8F4EC]" />
                    </Avatar>
                </div>

                <DialogContent className="flex flex-col gap-6 py-6">
                    <TextField
                        fullWidth
                        label="Имя пользователя"
                        defaultValue={userName}
                        inputRef={nameRef}
                        sx={FIELD_SX}
                    />
                    <TextField
                        fullWidth
                        label="Реквизиты"
                        inputRef={requisitesRef}
                        sx={FIELD_SX}
                    />

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleCashbacks}
                        className="!border-2 !border-[#463628] !text-[#463628] font-bold !rounded-xl py-3 hover:!bg-[#463628]"
                    >
                        МОИ КЭШБЕКИ
                    </Button>
                </DialogContent>

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
            </Dialog>
        </div>
    );
}
