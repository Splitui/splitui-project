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
import { useEffect, useRef, useState } from 'react';
import { FIELD_SX, MENU_PROPS } from '../Options';

export default function EditItem({
    open,
    onClose,
    item,
    usersOptions,
    onSave,
    onDelete,
}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const titleRef = useRef(null);
    const priceRef = useRef(null);

    const [participantIds, setParticipantIds] = useState([]);

    useEffect(() => {
        if (!open || !item) return;
        setParticipantIds(item.participantIds ?? []);
    }, [open, item]);

    if (!item) return null;

    const handleSubmit = () => {
        const title = titleRef.current.value.trim();
        const unitPrice = parseFloat(priceRef.current.value) || 0;

        if (!title || participantIds.length === 0) {
            return;
        }

        onSave({
            ...item,
            title,
            unitPrice,
            participantIds,
        });
        onClose();
    };

    const handleDelete = () => {
        onDelete(item.id);
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
                        fontSize: { xs: '28px', sm: '28px' },
                    }}
                >
                    Изменение позиции
                </Typography>
            </Box>

            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3 }}
            >
                <TextField
                    key={`title-${item.id}`}
                    fullWidth
                    label="Название товара"
                    defaultValue={item.title}
                    inputRef={titleRef}
                    sx={FIELD_SX}
                />
                <TextField
                    key={`price-${item.id}`}
                    fullWidth
                    label="Сумма"
                    type="number"
                    defaultValue={item.unitPrice}
                    inputRef={priceRef}
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 1 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: '#463628',
                        color: '#F8F4EC',
                        borderRadius: '10px',
                        py: 1.5,
                        fontSize: '18px',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#3a2c20', boxShadow: 'none' },
                    }}
                >
                    СОХРАНИТЬ ИЗМЕНЕНИЯ
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleDelete}
                    sx={{
                        backgroundColor: '#DAB672',
                        color: '#463628',
                        borderRadius: '10px',
                        py: 1.5,
                        fontSize: '18px',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#c9a25f', boxShadow: 'none' },
                    }}
                >
                    УДАЛИТЬ ПОЗИЦИЮ
                </Button>
            </Box>
        </Dialog>
    );
}
