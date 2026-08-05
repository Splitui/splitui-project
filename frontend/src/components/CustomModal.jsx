import {Modal, Box, Typography, Button} from "@mui/material";
export default function CustomModal({open, onClose}){
    return(
        <Modal className='flex items-center justify-center p-4' open={open} onClose={onClose}>
            <Box className='bg-white rounded-lg p-6 sm:w-2/3 md:h-2/5 max-w-md max-h-[85vh] flex flex-col overflow-y-auto'>
                <Typography className='text-sm text-center' sx={{mb:4}}>Модальное окно</Typography>
                <Box className='flex-1 text-center'sx={{mb:4}}>Основной контент</Box>
                <Button className='mt-auto' variant="contained" onClick={onClose}>Закрыть</Button>
            </Box>
        </Modal>
    );
}