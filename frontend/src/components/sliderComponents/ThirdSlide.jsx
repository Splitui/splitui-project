import clsx from 'clsx';
import InfoCard from './InfoCard';

export default function ThirdSlide() {
    return (
        <div className={clsx('flex flex-col justify-start items-center text-center')}>
            <div data-swiper-parallax="-200" className={clsx('mb-5')}>
                <h4 className={clsx('font-bold text-3xl leading-tight')}>Возможности</h4>
            </div>
            <div
                className={clsx('grid grid-cols-4 gap-1 w-full')}
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
            </div>
        </div>
    );
}
