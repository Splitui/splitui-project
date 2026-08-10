import clsx from 'clsx';
import LoginIcon from '@mui/icons-material/Login';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';

const FEATURES = [
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
        icon: AccountBalanceIcon,
        title: 'Переход в банк',
        text: 'Кнопка открывает приложение банка с суммой и назначением',
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
    {
        icon: EditIcon,
        title: 'Корректировка',
        text: 'Забытый чек можно добавить и после закрыть',
    },
];

export default function ThirdSlide() {
    return (
        <div
            className={clsx(
                'flex flex-col justify-start items-stretch px-6 text-center h-full bg-[#EAE0CD] py-8 rounded-2xl',
            )}
        >
            <div data-swiper-parallax="-200" className={clsx('mb-6')}>
                <h4 className={clsx('font-bold text-3xl leading-tight text-[#463628]')}>
                    Возможности
                </h4>
            </div>

            <div
                className={clsx('flex flex-col gap-3 w-full flex-1')}
                data-swiper-parallax="-100"
            >
                {FEATURES.map(({ icon, title, text }) => {
                    const Icon = icon;
                    return (
                        <div
                            key={title}
                            className={clsx(
                                'flex items-center gap-4 bg-[#f5efe6] border border-[#e5dcc9] rounded-xl p-4 text-left flex-1',
                            )}
                        >
                            <div
                                className={clsx(
                                    'flex items-center justify-center w-12 h-12 shrink-0',
                                )}
                            >
                                {Icon && <Icon sx={{ fontSize: 32, color: '#463628' }} />}
                            </div>
                            <div>
                                <div
                                    className={clsx(
                                        'font-bold text-xl leading-tight mb-1',
                                    )}
                                >
                                    {title}
                                </div>
                                <div
                                    className={clsx(
                                        'text-base leading-snug text-gray-600',
                                    )}
                                >
                                    {text}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
