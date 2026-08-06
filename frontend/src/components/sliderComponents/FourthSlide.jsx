import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import clsx from 'clsx';

export default function FourthSlide() {
    return (
        <div
            className={clsx(
                'flex flex-col justify-start items-center text-center w-full',
            )}
        >
            <div data-swiper-parallax="-200" className={clsx('mb-7')}>
                <h4 className={clsx('font-bold text-3xl')}>FAQ</h4>
            </div>
            <div
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
                        <p className={clsx('font-bold')}>Нужна ли регистрация?</p>
                    </AccordionSummary>
                    <AccordionDetails className={clsx('border-t-2 border-black')}>
                        <p className={clsx('text-left')}>
                            Нет, всё работает без аккаунта.
                        </p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    );
}
