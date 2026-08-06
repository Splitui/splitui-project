import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    useTheme,
    useMediaQuery,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
export default function AddMeeting({ open, onClose }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Dialog
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                Создание встречи
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <div className="mb-2">
                    <p className="mb-1">Название встречи</p>
                    <TextField fullWidth size="small" />
                </div>
                <div className="mb-2">
                    <p className="mb-1">Дата встречи</p>
                    <TextField fullWidth size="small" type="date" />
                </div>
                <div className="mb-2">
                    <p className="mb-1">Имя создателя встречи</p>
                    <TextField fullWidth size="small" />
                </div>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Кнопка
                </Button>
            </DialogActions>
        </Dialog>
    );
}
