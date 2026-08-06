import { Box, Typography } from '@mui/material';
import clsx from 'clsx';
import InfoCard from './InfoCard';

export default function SecondSlide() {
    return (
        <>
            <Box data-swiper-parallax="-200" className={clsx('mb-10')}>
                <Typography variant="h4" className={clsx('font-bold', 'leading-tight')}>
                    Как это работает?
                </Typography>
            </Box>
            <Box
                data-swiper-parallax="-100"
                className={clsx(
                    'flex flex-row items-center justify-center gap-0.5 w-full',
                )}
            >
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="w-[25%] h-62"
                />
                <Typography className={clsx('text-[10px]')}>→</Typography>
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="w-[25%] h-62"
                />
                <Typography className={clsx('text-[10px]')}>→</Typography>
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="w-[25%] h-62"
                />
                <Typography className={clsx('text-[10px]')}>→</Typography>
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="w-[25%] h-62"
                />
            </Box>
        </>
    );
}
