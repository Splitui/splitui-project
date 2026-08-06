import clsx from 'clsx';

export default function InfoCard({ title, icon, text, className }) {
    return (
        <div
            className={clsx(
                'border-2 border-black rounded-xl p-2 flex flex-col justify-between items-center leading-normal',
                className,
            )}
        >
            <p className={clsx('text-[16px] font-bold leading-tight')}>{title}</p>
            <span className={clsx('text-xl')}>{icon}</span>
            <p className={clsx('text-[14px] leading-tight')}>{text}</p>
        </div>
    );
}
