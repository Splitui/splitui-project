import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Parallax, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import FirstSlide from './FirstSlide';
import SecondSlide from './SecondSlide';
import ThirdSlide from './ThirdSlide';
import FourthSlide from './FourthSlide';

export default function Slider({ onSlideChange, onOpenAdd, onOpenJoin }) {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleSlideChange = (swiper) => {
        setActiveIndex(swiper.activeIndex);
        onSlideChange?.(swiper);
    };

    const goToSlide = (index) => {
        swiperRef.current?.slideTo(index);
    };

    const isFaqSlide = activeIndex === 3;
    return (
        <div className="flex h-full min-h-0 w-full flex-col">
            <div className="min-h-0 flex-1">
                <Swiper
                    speed={600}
                    parallax={true}
                    mousewheel={true}
                    modules={[Mousewheel, Parallax]}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onSlideChange={handleSlideChange}
                    className="h-full w-full"
                >
                    <SwiperSlide className="h-full overflow-y-auto px-6 pt-5">
                        <FirstSlide />
                    </SwiperSlide>
                    <SwiperSlide className="h-full overflow-y-auto px-6 pt-5">
                        <SecondSlide />
                    </SwiperSlide>
                    <SwiperSlide className="h-full overflow-y-auto px-6 pt-5">
                        <ThirdSlide />
                    </SwiperSlide>
                    <SwiperSlide className="h-full overflow-y-auto px-6 pt-5">
                        <FourthSlide />
                    </SwiperSlide>
                </Swiper>
            </div>

            <div className="shrink-0 px-6 pb-6 pt-3">
                <div className="flex justify-center gap-1 pb-4">
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1 cursor-pointer rounded-full transition-all ${
                                activeIndex === index
                                    ? 'w-5 bg-[#2E2519]'
                                    : 'w-1 bg-[#2E2519]'
                            }`}
                        />
                    ))}
                </div>

                {isFaqSlide ? (
                    <button
                        onClick={() => goToSlide(0)}
                        className="w-full rounded-2xl border border-[#C3B394] bg-transparent py-3 text-base font-semibold text-[#2E2519]"
                    >
                        Вернуться в начало
                    </button>
                ) : (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onOpenAdd}
                            className="w-full rounded-2xl bg-[#2E2519] py-4 text-base font-semibold text-[#F7F1E3]"
                        >
                            Создать встречу
                        </button>
                        <button
                            onClick={onOpenJoin}
                            className="w-full rounded-2xl border border-[#C3B394] bg-transparent py-[15px] text-base font-semibold text-[#2E2519]"
                        >
                            Войти во встречу
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
