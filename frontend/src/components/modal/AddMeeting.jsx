import {
    Dialog,
    DialogContent,
    IconButton,
    Button,
    useTheme,
    useMediaQuery,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function AddMeeting({ open, onClose }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const [meetingName, setMeetingName] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [adminName, setAdminName] = useState('');

    const handleCreate = () => {
        Cookies.set('meetingName', meetingName);
        Cookies.set('meetingDate', meetingDate);
        Cookies.set('adminName', adminName);

        const uuid = Math.random().toString(36).substr(2, 9);
        navigate(`/meeting/${uuid}`);
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
        >
            <div className="flex items-center justify-between p-4">
                Создание встречи
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </div>
            <DialogContent dividers>
                <div className="mb-2">
                    <p className="mb-1">Название встречи</p>
                    <TextField
                        fullWidth
                        size="small"
                        value={meetingName}
                        onChange={(e) => setMeetingName(e.target.value)}
                    />
                </div>
                <div className="mb-2">
                    <p className="mb-1">Дата встречи</p>
                    <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                    />
                </div>
                <div className="mb-2">
                    <p className="mb-1">Имя создателя встречи</p>
                    <TextField
                        fullWidth
                        size="small"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                    />
                </div>
            </DialogContent>
            <div className="flex justify-center pb-3">
                <Button variant="outlined" onClick={handleCreate}>
                    Кнопка
                </Button>
            </div>
        </Dialog>
    );
}
