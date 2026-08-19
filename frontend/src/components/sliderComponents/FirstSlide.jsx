import logo from '../logo/logo.png';

export default function FirstSlide() {
    return (
        <div className="flex flex-col justify-center items-center text-center bg-[#EAE0CD] h-full sm:py-10 px-4 rounded-2xl">
            <img
                src={logo}
                alt="Сплитуй"
                className="w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain mb-2"
            />
            <div className="mb-6 sm:mb-10">
                <div data-swiper-parallax="-150" className="mb-7 sm:mb-7">
                    <h4 className="font-bold leading-tight text-[#463628]">
                        <span className="text-2xl sm:text-3xl">
                            Честный делёж общих трат
                        </span>{' '}
                        <br />
                        <span className="text-3xl sm:text-4xl">за 60 секунд</span>
                    </h4>
                </div>
                <div
                    data-swiper-parallax="-100"
                    className="flex flex-col gap-2 text-2xl text-[#463628] sm:text-2xl"
                >
                    <div>✓ Без аккаунтов</div>
                    <div>✓ Сканирование чеков</div>
                    <div>✓ Минимум переводов</div>
                </div>
            </div>
        </div>
    );
}
