import logo from '../logo/logo.png';

export default function FirstSlide() {
    return (
        <div className="flex flex-col justify-start items-center text-center bg-[#EAE0CD] h-full py-10 rounded-2xl">
            <img src={logo} alt="Сплитуй" className="w-100 h-100 object-contain mb-2" />
            <div className="mt-auto mb-10">
                <div data-swiper-parallax="-150" className="mb-7">
                    <h4 className="font-bold leading-tight text-[#463628]">
                        <span className="text-3xl">Честный делёж общих трат</span> <br />
                        <span className="text-4xl">за 60 секунд</span>
                    </h4>
                </div>
                <div
                    data-swiper-parallax="-100"
                    className="flex flex-col gap-2 text-2xl text-[#463628]"
                >
                    <div>✓ Без аккаунтов</div>
                    <div>✓ Сканирование чеков</div>
                    <div>✓ Минимум переводов</div>
                </div>
            </div>
        </div>
    );
}
