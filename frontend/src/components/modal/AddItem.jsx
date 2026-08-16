import {
    Dialog,
    DialogContent,
    IconButton,
    Button,
    Typography,
    Box,
    TextField,
    MenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRef, useState } from 'react';
import { FIELD_SX, MENU_PROPS } from '../Options';

export default function AddItem({ open, onClose, usersOptions, onAdd }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const titleRef = useRef(null);
    const priceRef = useRef(null);
    const quantityRef = useRef(null);

    const [participantIds, setParticipantIds] = useState([]);

    const handleSubmit = () => {
        const title = titleRef.current.value.trim();
        const unitPrice = parseFloat(priceRef.current.value) || 0;
        const quantity = parseInt(quantityRef.current.value, 10) || 1;

        if (!title || participantIds.length === 0) {
            return;
        }

        onAdd({
            id: Date.now(),
            title,
            unitPrice,
            quantity,
            participantIds,
        });

        titleRef.current.value = '';
        priceRef.current.value = '';
        quantityRef.current.value = '';
        setParticipantIds([]);
        onClose();
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={onClose}
            sx={{ zIndex: (t) => t.zIndex.modal + 2 }}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: '#EAE0CD',
                        p: { xs: 2, sm: 3 },
                        borderRadius: fullScreen ? 0 : '20px',
                    },
                },
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', top: 12, right: 12, color: '#463628' }}
            >
                <CloseIcon />
            </IconButton>

            <Box sx={{ textAlign: 'center', pt: 2, pb: 1 }}>
                <Typography
                    sx={{
                        fontWeight: 800,
                        color: '#463628',
                        fontSize: { xs: '24px', sm: '24px' },
                    }}
                >
                    Добавление позиции
                </Typography>
            </Box>

            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}
            >
                <TextField
                    fullWidth
                    label="Название товара"
                    inputRef={titleRef}
                    sx={FIELD_SX}
                />
                <TextField
                    fullWidth
                    label="Стоимость"
                    type="number"
                    inputRef={priceRef}
                    sx={FIELD_SX}
                />
                <TextField
                    fullWidth
                    label="Количество"
                    type="number"
                    inputRef={quantityRef}
                    sx={FIELD_SX}
                />
                <TextField
                    select
                    fullWidth
                    label="Кто платит"
                    value={participantIds}
                    onChange={(e) => setParticipantIds(e.target.value)}
                    sx={FIELD_SX}
                    slotProps={{
                        select: {
                            multiple: true,
                            MenuProps: {
                                ...MENU_PROPS,
                                sx: {
                                    zIndex: (t) => t.zIndex.modal + 3,
                                },
                            },
                            renderValue: (selected) =>
                                usersOptions
                                    .filter((o) => selected.includes(o.value))
                                    .map((o) => o.label)
                                    .join(', '),
                        },
                    }}
                >
                    {usersOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </DialogContent>

            <Box sx={{ px: { xs: 0, sm: 0 }, pb: 1 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: '#463628',
                        color: '#F8F4EC',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        py: 1.5,
                        fontSize: '18px',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#3a2c20', boxShadow: 'none' },
                    }}
                >
                    ДОБАВИТЬ ПОЗИЦИЮ
                </Button>
            </Box>
        </Dialog>
    );
}
