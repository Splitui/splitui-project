import { Swiper, SwiperSlide } from 'swiper/react';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { Mousewheel, Parallax, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import FirstSlide from './slyderComponents/FirstSlide';
import SecondSlide from './slyderComponents/SecondSlide';
import ThirdSlide from './slyderComponents/ThirdSlide';
import FourthSlide from './slyderComponents/FourthSlide';

export default function Slyder() {
    return (
        <Box className={clsx('w-full', 'h-[600px]')}>
            <Swiper
                speed={600}
                parallax={true}
                mousewheel={true}
                pagination={{ clickable: true }}
                modules={[Mousewheel, Parallax, Pagination]}
                className={clsx('w-full', 'h-full')}
            >
                <SwiperSlide
                    className={clsx(
                        'flex flex-col justify-start items-center px-16 text-center',
                    )}
                >
                    <FirstSlide />
                </SwiperSlide>

                <SwiperSlide
                    className={clsx(
                        'flex flex-col justify-start items-center px-8 text-center',
                    )}
                >
                    <SecondSlide />
                </SwiperSlide>

                <SwiperSlide
                    className={clsx(
                        'flex flex-col justify-start items-center px-6 text-center',
                    )}
                >
                    <ThirdSlide />
                </SwiperSlide>

                <SwiperSlide
                    className={clsx(
                        'flex flex-col justify-start items-center px-16 text-center',
                    )}
                >
                    <FourthSlide />
                </SwiperSlide>
            </Swiper>
        </Box>
    );
}
