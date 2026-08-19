import LoginIcon from '@mui/icons-material/Login';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';

const features = [
    {
        icon: LoginIcon,
        title: 'Без регистрации',
        text: 'Вход по ссылке, QR-коду или ID + коду',
    },
    {
        icon: CameraAltIcon,
        title: 'Сканирование чеков',
        text: 'Фото - сумма, да и позиции распознаются автоматически',
    },
    {
        icon: CallSplitIcon,
        title: 'Умное деление',
        text: 'Общий чек, на всех, на выбранных или на одного',
    },
    {
        icon: CreditCardIcon,
        title: 'Подсказки по кешбеку',
        text: '"По этой категории у вас кешбек 5% в банке Х"',
    },
    {
        icon: PictureAsPdfIcon,
        title: 'Отчет PDF',
        text: 'Список трат, баланс, схема переводов, экономия',
    },
];

export default function ThirdSlide() {
    return (
        <div className="flex h-full flex-col">
            <div data-swiper-parallax="-200">
                <div className="text-2xl font-semibold tracking-tight text-[#2E2519] sm:text-3xl">
                    Возможности
                </div>
                <div className="mb-5 mt-1 text-sm text-[#8A7C66]">
                    Всё, что нужно в поездке
                </div>
            </div>

            <div data-swiper-parallax="-100" className="flex flex-col gap-3">
                {features.map(({ icon: Icon, title, text }) => (
                    <div
                        key={title}
                        className="flex items-start gap-3 rounded-2xl border border-[#E4D8BE] bg-[#FFFDF7] p-3"
                    >
                        <Icon sx={{ fontSize: 24, color: '#2E2519', flexShrink: 0 }} />
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
