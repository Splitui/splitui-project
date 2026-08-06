import clsx from 'clsx';

export default function FirstSlide() {
    return (
        <div className={clsx('flex flex-col justify-start items-center text-center')}>
            <div data-swiper-parallax="-200" className={clsx('mb-7')}>
                <h4 className={clsx('font-bold text-3xl leading-tight')}>
                    Честный делёж общих трат за 60 секунд
                </h4>
            </div>
            <div
                data-swiper-parallax="-100"
                className={clsx('flex justify-center gap-6 text-center items-start')}
            >
                <div className={clsx('w-20 text-[14px]')}>
                    ✓ <br /> Без аккаунтов
                </div>
                <div className={clsx('w-20 text-[14px]')}>
                    ✓ <br /> Сканирование чеков
                </div>
                <div className={clsx('w-20 text-[14px]')}>
                    ✓ <br /> Минимум переводов
                </div>
            </div>
        </div>
    );
}
