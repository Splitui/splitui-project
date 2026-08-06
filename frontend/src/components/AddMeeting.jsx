import {Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Typography, Button, useTheme, useMediaQuery, TextField} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
export default function AddMeeting({open, onClose}){
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    return(
        <Dialog fullScreen={fullScreen} fullWidth maxWidth='sm' open={open} onClose={onClose}> 
            <DialogTitle sx={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                Создание встречи
                <IconButton onClick={onClose} size="small">
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{mb:2}}>
                    <Typography variant="body2" sx={{mb:1}}>Название встречи</Typography>
                    <TextField fullWidth size="small"/>
                </Box>
                <Box sx={{mb:2}}>
                    <Typography variant="body2" sx={{mb:1}}>Дата встречи</Typography>
                    <TextField fullWidth size="small" type="date"/>
                </Box>
                <Box sx={{mb:2}}>
                    <Typography variant="body2" sx={{mb:1}}>Имя создателя встречи</Typography>
                    <TextField fullWidth size="small"/>
                </Box>
            </DialogContent>
            <DialogActions sx={{justifyContent:'center', pb:3}}>
                <Button variant="outlined" onClick={onClose}>Кнопка</Button>
            </DialogActions>
        </Dialog>
    );
}