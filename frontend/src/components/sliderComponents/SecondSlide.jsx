import clsx from 'clsx';
import InfoCard from './InfoCard';

export default function SecondSlide() {
    return (
        <div
            className={clsx('flex flex-col justify-start items-center px-2 text-center')}
        >
            <div data-swiper-parallax="-200" className={clsx('mb-10')}>
                <h4 className={clsx('font-bold text-2xl leading-tight')}>
                    Как это работает?
                </h4>
            </div>
            <div
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
                <span className={clsx('text-[18px]')}>→</span>
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="w-[25%] h-62"
                />
                <span className={clsx('text-[18px]')}>→</span>
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="w-[25%] h-62"
                />
                <span className={clsx('text-[18px]')}>→</span>
                <InfoCard
                    title="Создать встречу"
                    icon="+"
                    text="Название и даты — комната готова за 10 секунд"
                    className="w-[25%] h-62"
                />
            </div>
        </div>
    );
}
