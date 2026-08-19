import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Parallax, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import FirstSlide from './FirstSlide';
import SecondSlide from './SecondSlide';
import ThirdSlide from './ThirdSlide';
import FourthSlide from './FourthSlide';

export default function Slider({ onSlideChange }) {
    return (
        <div className="w-full h-full">
            <Swiper
                speed={600}
                parallax={true}
                mousewheel={true}
                pagination={{ clickable: true }}
                modules={[Mousewheel, Parallax, Pagination]}
                onSlideChange={onSlideChange}
                className="w-full h-full"
                style={{
                    '--swiper-pagination-color': '#463628',
                    '--swiper-pagination-bullet-inactive-color': '#463628',
                    '--swiper-pagination-bullet-inactive-opacity': 0.3,
                }}
            >
                <SwiperSlide className="h-full flex flex-col items-center px-16 text-center">
                    <FirstSlide />
                </SwiperSlide>

                <SwiperSlide className="h-full flex flex-col items-center px-16 text-center">
                    <SecondSlide />
                </SwiperSlide>

                <SwiperSlide className="h-full flex flex-col items-center px-16 text-center">
                    <ThirdSlide />
                </SwiperSlide>

                <SwiperSlide className="h-full flex flex-col items-center px-16 text-center">
                    <FourthSlide />
                </SwiperSlide>
            </Swiper>
        </div>
    );
}
