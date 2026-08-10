import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import clsx from 'clsx';

export default function FourthSlide() {
    return (
        <div
            className={clsx(
                'flex flex-col justify-start items-center text-center w-full h-full bg-[#EAE0CD] py-8 px-6 rounded-2xl',
            )}
        >
            <div data-swiper-parallax="-200" className={clsx('mb-7')}>
                <h4 className={clsx('font-bold text-3xl text-[#463628]')}>FAQ</h4>
            </div>
            <div
                data-swiper-parallax="-100"
                className={clsx('w-full flex flex-col gap-2')}
            >
                <Accordion
                    className={clsx('bg-[#F8F4EC] rounded-xl')}
                    disableGutters
                    elevation={0}
                    sx={{
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        color: '#463628',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#463628' }} />}
                    >
                        <p>Нужна ли регистрация?</p>
                    </AccordionSummary>
                    <AccordionDetails className={clsx('border-t border-[#EAE0CD]')}>
                        <p className={clsx('text-left opacity-70')}>
                            Нет, всё работает без аккаунта.
                        </p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    );
}
