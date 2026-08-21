import AddIcon from '@mui/icons-material/Add';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import clsx from 'clsx';

const steps = [
    {
        number: 1,
        title: 'Создайте встречу',
        text: 'Название и дата — 10 секунд, без регистрации.',
    },
    {
        number: 2,
        title: 'Позовите друзей',
        text: 'Ссылка или QR-код — участники заходят в один тап.',
    },
    {
        number: 3,
        title: 'Добавляйте чеки',
        text: 'Сфотографируйте чек — позиции распознаются сами.',
    },
    {
        number: 4,
        title: 'Получите расчёт',
        text: 'Кто кому и сколько — минимальным числом переводов.',
    },
];

export default function SecondSlide() {
    return (
        <div className="flex h-full flex-col">
            <div data-swiper-parallax="-200">
                <div className="text-2xl font-semibold tracking-tight text-[#2E2519] sm:text-3xl">
                    Как это работает
                </div>
                <div className="mb-6 mt-1 text-sm text-[#8A7C66]">
                    Четыре шага до честного расчёта
                </div>
            </div>

            <div data-swiper-parallax="-100" className="flex flex-col gap-5">
                {steps.map(({ number, title, text }) => (
                    <div key={number} className="flex items-start gap-4">
                        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#2E2519] text-sm font-bold text-[#F0DFB8]">
                            {number}
                        </div>
                        <div>
                            <div className="text-base font-semibold text-[#2E2519]">
                                {title}
                            </div>
                            <div className="mt-1 text-base leading-snug text-[#8A7C66]">
                                {text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
