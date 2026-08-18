import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode/esm/html5-qrcode';
import { Dialog, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function QrScanner({ open, onClose, onScanned }) {
    useEffect(() => {
        if (!open) return;
        let html5QrCode;
        let handled = false;
        let cancelled = false;

        const stop = () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(() => {});
            }
        };

        (async () => {
            const { Html5Qrcode } = await import('html5-qrcode');
            await new Promise((r) => requestAnimationFrame(r));
            if (cancelled) return;
            if (!document.getElementById('qrCodeContainer')) return;

            html5QrCode = new Html5Qrcode('qrCodeContainer');

            const onSuccess = (decodedText) => {
                if (handled) return;
                handled = true;
                stop();
                onScanned(decodedText);
            };

            html5QrCode
                .start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onSuccess,
                    () => {},
                )
                .catch(() => {});
        })();

        return () => {
            cancelled = true;
            stop();
        };
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#463628',
                    zIndex: 1,
                }}
            >
                <CloseIcon />
            </IconButton>
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 800, color: '#463628', mb: 2 }}>
                    Наведите камеру на QR чека
                </Typography>
                <div id="qrCodeContainer" style={{ width: '100%' }} />
            </Box>
        </Dialog>
    );
}
