import clsx from 'clsx';

export default function InfoCard({ number, title, icon: Icon, text, className }) {
    return (
        <div
            className={clsx(
                'bg-[#F8F4EC] rounded-xl pt-2 pb-3 px-2 flex flex-col items-center justify-center leading-normal text-[#463628]',
                className,
            )}
        >
            <p className="text-3xl font-bold leading-none mb-1">{number}</p>
            <p className="text-2xl font-bold leading-tight mb-2">{title}</p>
            <Icon sx={{ fontSize: 32 }} className="mb-2" />
            <p className="text-xl leading-tight text-[#463628]">{text}</p>
        </div>
    );
}
