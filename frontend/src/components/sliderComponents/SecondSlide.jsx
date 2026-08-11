import InfoCard from './InfoCard';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function SecondSlide() {
    return (
        <div className="flex flex-col justify-start items-stretch px-2 sm:px-4 text-center h-full bg-[#EAE0CD] py-8 sm:py-8 rounded-2xl">
            <div data-swiper-parallax="-200" className="mb-6 sm:mb-6">
                <h4 className="font-bold text-2xl sm:text-3xl leading-tight text-[#463628]">
                    Как это работает?
                </h4>
            </div>
            <div
                data-swiper-parallax="-100"
                className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 w-full flex-1 justify-items-center"
            >
                <InfoCard
                    number="1"
                    title="Создайте встречу"
                    icon={AddIcon}
                    text="Название и даты — комната готова за 10 секунд"
                    className="h-full w-full"
                />
                <InfoCard
                    number="2"
                    title="Пригласите друзей"
                    icon={PersonOutlineIcon}
                    text="Ссылка, QR-код или ID + секретный код"
                    className="h-full w-full"
                />
                <InfoCard
                    number="3"
                    title="Добавьте чеки"
                    icon={ReceiptLongIcon}
                    text="Фото чека или вручную - деление на всех или по позициям"
                    className="h-full w-full"
                />
                <InfoCard
                    number="4"
                    title="Получите расчёт"
                    icon={AccountBalanceWalletIcon}
                    text="Кто кому должен, минимум переводов, переход в банк в один тап"
                    className="h-full w-full"
                />
            </div>
        </div>
    );
}
