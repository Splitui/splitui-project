import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import clsx from 'clsx';

export default function FaqSlide() {
    return (
        <>
            <Box data-swiper-parallax="-200" className={clsx('mb-7')}>
                <Typography variant="h4" className={clsx('font-bold')}>
                    FAQ
                </Typography>
            </Box>
            <Box
                data-swiper-parallax="-100"
                className={clsx('w-full flex flex-col gap-2')}
            >
                <Accordion
                    className={clsx('border-2 border-black rounded-xl')}
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={clsx('font-bold')}>
                            Нужна ли регистрация?
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={clsx('border-t-2 border-black')}>
                        <Typography>Нет, всё работает без аккаунта.</Typography>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </>
    );
}
