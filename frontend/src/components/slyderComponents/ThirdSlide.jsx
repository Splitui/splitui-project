import { Box, Typography } from '@mui/material';
import clsx from 'clsx';
import InfoCard from './InfoCard';

export default function FeaturesSlide() {
    return (
        <>
            <Box data-swiper-parallax="-200" className={clsx('mb-5')}>
                <Typography variant="h4" className={clsx('font-bold', 'leading-tight')}>
                    Возможности
                </Typography>
            </Box>
            <Box
                className={clsx('grid', 'grid-cols-4', 'gap-1', 'w-full')}
                data-swiper-parallax="-100"
            >
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-62"
                />
            </Box>
        </>
    );
}
