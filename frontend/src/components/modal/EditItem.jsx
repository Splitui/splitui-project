import { Dialog, IconButton, Button, Typography, Box, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState, forwardRef } from 'react';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #D9CBAE',
    borderRadius: '11px',
    padding: '13px',
    fontSize: '15px',
    background: '#FFFDF7',
    color: '#2E2519',
    outline: 'none',
    fontFamily: 'inherit',
};

const labelStyle = { fontSize: 12, color: '#8A7C66', mb: 0.6 };

export default function EditItem({
    open,
    onClose,
    item,
    usersOptions,
    onSave,
    onDelete,
}) {
    const titleRef = useRef(null);
    const priceRef = useRef(null);
    const quantityRef = useRef(null); 
    const [participantIds, setParticipantIds] = useState([]);

    useEffect(() => {
        if (!open || !item) return;
        const loadParticipants = async () => {
            setParticipantIds(item.participantIds ?? []);
        };
        loadParticipants();
    }, [open, item]);

    if (!item) return null;

    const toggle = (id) =>
        setParticipantIds((prev) => {
            if (prev.includes(id)) {
                if (prev.length === 1) return prev;
                return prev.filter((x) => x !== id);
            }
            return [...prev, id];
        });

    const handleSubmit = () => {
        const title = titleRef.current.value.trim();
        const unitPrice = parseFloat(priceRef.current.value) || 0;
        const quantity = parseInt(quantityRef.current.value, 10) || 1;
        if (!title || participantIds.length === 0) return;
        onSave({ ...item, title, unitPrice, quantity });
        onClose();
    };

    const handleDelete = () => {
        onDelete(item.id);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Transition}
            sx={{
                zIndex: (t) => t.zIndex.modal + 2,
                '& .MuiDialog-container': { alignItems: 'flex-end' },
            }}
            slotProps={{
                paper: {
                    sx: {
                        m: 0,
                        width: '100%',
                        maxWidth: '100%',
                        borderRadius: '26px 26px 0 0',
                        backgroundColor: '#F7F1E3',
                        p: '10px 22px 24px',
                        maxHeight: '94%',
                    },
                },
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#D3C4A5',
                    mx: 'auto',
                    mb: 2,
                }}
            />

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#2E2519' }}>
                    Изменение позиции
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#9C8B6F', mr: -0.5 }}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelStyle}>Название позиции</Typography>
                <input
                    key={`title-${item.id}`}
                    ref={titleRef}
                    defaultValue={item.title}
                    placeholder="Название"
                    style={inputStyle}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.25, mb: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={labelStyle}>Сумма</Typography>
                    <input
                        key={`price-${item.id}`}
                        ref={priceRef}
                        type="text"
                        inputMode="decimal"
                        defaultValue={item.unitPrice}
                        placeholder="0"
                        style={{ ...inputStyle, textAlign: 'right' }}
                    />
                </Box>
                <Box sx={{ width: 100 }}>
                    <Typography sx={labelStyle}>Кол-во</Typography>
                    <input
                        key={`qty-${item.id}`}
                        ref={quantityRef}
                        type="text"
                        inputMode="numeric"
                        defaultValue={item.quantity}
                        placeholder="1"
                        style={{ ...inputStyle, textAlign: 'center' }}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    background: '#FFFDF7',
                    border: '1px solid #E4D8BE',
                    borderRadius: '13px',
                    p: '13px 14px',
                    mb: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.4,
                    }}
                >
                    <Typography sx={{ fontSize: 12.5, color: '#8A7C66' }}>
                        Кто платит
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: '#7A5316',
                            background: '#F1E4C6',
                            px: 1.1,
                            py: 0.4,
                            borderRadius: '8px',
                        }}
                    >
                        {participantIds.length} чел.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {usersOptions.map((o) => {
                        const active = participantIds.includes(o.value);
                        return (
                            <Box
                                key={o.value}
                                onClick={() => toggle(o.value)}
                                sx={{ textAlign: 'center', cursor: 'pointer', width: 52 }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        mx: 'auto',
                                        borderRadius: '50%',
                                        background: '#E6D9BA',
                                        color: '#7A5316',
                                        border: active
                                            ? '2px solid #2E2519'
                                            : '2px solid transparent',
                                        opacity: active ? 1 : 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    {o.label?.[0]?.toUpperCase()}
                                </Box>
                                <Typography
                                    sx={{
                                        fontSize: 10.5,
                                        color: '#8A7C66',
                                        mt: 0.6,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {o.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Button
                fullWidth
                onClick={handleSubmit}
                sx={{
                    py: 2,
                    borderRadius: '14px',
                    backgroundColor: '#2E2519',
                    color: '#F7F1E3',
                    fontSize: 16,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: '#3a2c20', boxShadow: 'none' },
                }}
            >
                Сохранить изменения
            </Button>
            <Button
                fullWidth
                onClick={handleDelete}
                sx={{
                    mt: 1.25,
                    py: 1.5,
                    borderRadius: '14px',
                    color: '#8A5B12',
                    fontSize: 15,
                    fontWeight: 600,
                    textTransform: 'none',
                }}
            >
                Удалить позицию
            </Button>
        </Dialog>
    );
}
