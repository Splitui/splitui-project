import { Box, Typography } from '@mui/material';
import clsx from 'clsx';

export default function FirstSlide() {
    return (
        <>
            <Box data-swiper-parallax="-200" className={clsx('mb-7')}>
                <Typography variant="h4" className={clsx('font-bold leading-tight')}>
                    Честный делёж общих трат за 60 секунд
                </Typography>
            </Box>
            <Box
                data-swiper-parallax="-100"
                className={clsx('flex justify-center gap-6 text-center items-start')}
            >
                <Box className={clsx('w-20 text-[14px]')}>
                    ✓ <br /> Без аккаунтов
                </Box>
                <Box className={clsx('w-20 text-[14px]')}>
                    ✓ <br /> Сканирование чеков
                </Box>
                <Box className={clsx('w-20 text-[14px]')}>
                    ✓ <br /> Минимум переводов
                </Box>
            </Box>
        </>
    );
}
