import { Box, Typography } from '@mui/material';
import clsx from 'clsx';

export default function InfoCard({ title, icon, text, className }) {
    return (
        <Box
            className={clsx(
                'border-2 border-black rounded-xl p-2 flex flex-col justify-between items-center',
                className,
            )}
        >
            <Typography className={clsx('text-[9px] font-bold leading-tight')}>
                {title}
            </Typography>
            <Typography className={clsx('text-xl')}>{icon}</Typography>
            <Typography className={clsx('text-[8px] leading-tight')}>{text}</Typography>
        </Box>
    );
}
