import logo from '../../../public/logo.png';

export default function FirstSlide() {
    return (
        <div className="flex h-full flex-col">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-[#2E2519] flex items-center justify-center">
                <img src={logo} alt="Сплитуй" className="h-14 w-14 object-contain" />
            </div>

            <div className="mt-5 text-4xl font-bold tracking-tight text-[#2E2519] sm:text-5xl">
                Сплитуй
            </div>
            <div className="mt-1.5 text-sm text-[#8A7C66]">
                Один чек — и все в расчёте
            </div>

            <div className="min-h-6 flex-1" />

            <div
                data-swiper-parallax="-150"
                className="text-2xl font-semibold leading-tight tracking-tight text-[#2E2519] sm:text-3xl"
            >
                Честный делёж общих трат за 60 секунд
            </div>

            <div data-swiper-parallax="-100" className="mt-5 flex flex-col gap-2.5 pb-2">
                <div className="flex items-center gap-2.5 text-sm text-[#5C5142]">
                    <span className="text-[#9A6B22]">✓</span>Сканирование чеков по фото
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#5C5142]">
                    <span className="text-[#9A6B22]">✓</span>Минимум переводов в конце
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#5C5142]">
                    <span className="text-[#9A6B22]">✓</span>Без аккаунтов и регистрации
                </div>
            </div>
        </div>
    );
}
