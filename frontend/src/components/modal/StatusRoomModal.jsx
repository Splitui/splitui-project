import { Drawer, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import clsx from 'clsx';

const STATUSES = [
    {
        key: 'active',
        title: 'Активна',
        text: 'Все добавляют расходы и чеки. Балансы пересчитываются на лету.',
        dotColor: '#3F7A3A',
    },
    {
        key: 'settle',
        title: 'Оплата',
        text: 'Расходы заморожены. Участники переводят деньги и подтверждают получение.',
        dotColor: '#C9A55F',
    },
    {
        key: 'done',
        title: 'Завершена',
        text: 'Только чтение. Доступен PDF-отчёт, изменения запрещены.',
        dotColor: '#A2947A',
    },
];

const WARNINGS = {
    active: 'Когда все расходы внесены, переведите встречу в «Оплату» — расходы заморозятся.',
    settle: 'Вернуть в «Активна» можно в любой момент, пока встреча не завершена.',
    done: 'Чтобы что-то поправить, верните встречу в «Оплату» — все участники получат уведомление.',
};

export default function StatusRoomModal({
    open,
    onClose,
    status = 'active',
    onChange,
    creatorName,
    canChange = true,
}) {
    const [chosenStatus, setChosenStatus] = useState(status);
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setChosenStatus(status);
    }

    const handleDone = () => {
        if (canChange && chosenStatus !== status) onChange?.(chosenStatus);
        onClose();
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        borderTopLeftRadius: '26px',
                        borderTopRightRadius: '26px',
                        backgroundColor: '#F7F1E3',
                        backgroundImage: 'none',
                        width: '100%',
                        maxWidth: '100%',
                        maxHeight: '92%',
                        margin: 0,
                    },
                },
            }}
        >
            <div className="px-[22px] pt-[10px] pb-6">
                <div className="w-[38px] h-1 bg-[#D3C4A5] rounded-[2px] mx-auto mb-4" />

                <div className="flex justify-between items-start gap-2">
                    <div>
                        <Typography className="!font-bold !text-[#2E2519] !text-[20px] !leading-tight">
                            Состояние встречи
                        </Typography>
                        <p className="m-0 mt-1 text-[13px] text-[#8A7C66]">
                            {creatorName
                                ? `Менять может создатель — ${creatorName}`
                                : 'Менять может только создатель'}
                        </p>
                    </div>
                    <IconButton onClick={onClose} className="!p-0 !text-[#9C8B6F]">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <div className="flex flex-col gap-2.5 mt-4">
                    {STATUSES.map(({ key, title, text, dotColor }) => {
                        const isChosen = chosenStatus === key;

                        return (
                            <button
                                key={key}
                                type="button"
                                disabled={!canChange}
                                onClick={() => setChosenStatus(key)}
                                className={clsx(
                                    'w-full text-left select-none p-3.5 rounded-[13px] border border-solid transition-colors',
                                    isChosen
                                        ? 'border-2 border-[#2E2519] bg-[#FFFDF7]'
                                        : 'border-[#E0D3B7] bg-[#FBF7EC]',
                                    canChange ? 'cursor-pointer' : 'cursor-default',
                                )}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className="w-[10px] h-[10px] rounded-full shrink-0"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                    <span className="flex-1 text-[15.5px] font-semibold text-[#2E2519]">
                                        {title}
                                    </span>
                                    {isChosen && (
                                        <span className="text-[15px] text-[#3F7A3A]">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <p className="m-0 mt-1.5 pl-5 text-[12.5px] text-[#7C6E58] leading-[1.45]">
                                    {text}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 px-3.5 py-[13px] rounded-xl bg-[#F1E7D0] text-[12.5px] text-[#5C5142] leading-[1.45]">
                    {WARNINGS[chosenStatus] ?? WARNINGS.active}
                </div>

                <button
                    type="button"
                    onClick={handleDone}
                    className="w-full mt-4 py-[15px] border-none rounded-[14px] bg-[#2E2519] text-[#F7F1E3] text-[15.5px] font-semibold cursor-pointer font-[inherit]"
                >
                    Готово
                </button>
            </div>
        </Drawer>
    );
}
