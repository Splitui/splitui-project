import { Dialog, IconButton, Button, Box, Typography, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, forwardRef } from 'react';
import AddItem from './AddItem';
import EditItem from './EditItem';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function computeTotals(items, usersOptions) {
    const total = items.reduce((sum, it) => sum + it.unitPrice * (it.quantity || 1), 0);

    const perPerson = {};
    usersOptions.forEach((u) => {
        perPerson[u.value] = 0;
    });

    items.forEach((it) => {
        const itemTotal = it.unitPrice * (it.quantity || 1);
        const ids = it.participantIds;
        if (!ids || ids.length === 0) return;
        const share = itemTotal / ids.length;
        ids.forEach((id) => {
            perPerson[id] = (perPerson[id] || 0) + share;
        });
    });

    return { total, perPerson };
}

function ItemRow({ item, usersOptions, onEditClick }) {
    const participants = usersOptions.filter((u) =>
        item.participantIds.includes(u.value),
    );

    return (
        <Box
            onClick={() => onEditClick(item)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 1.5,
                cursor: 'pointer',
                borderBottom: '1px solid #E2D6BC',
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: '#2E2519' }}>
                    {item.title}
                    {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </Typography>
                {item.quantity > 1 && (
                    <Typography sx={{ fontSize: 11.5, color: '#8A7C66', mt: 0.25 }}>
                        по {item.unitPrice} ₽
                    </Typography>
                )}
            </Box>
            <Box sx={{ display: 'flex' }}>
                {participants.slice(0, 3).map((p, i) => (
                    <Box
                        key={p.value}
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: '#E6D9BA',
                            color: '#7A5316',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 600,
                            ml: i === 0 ? 0 : '-7px',
                            border: '1.5px solid #F7F1E3',
                        }}
                    >
                        {p.label?.[0]?.toUpperCase()}
                    </Box>
                ))}
                {participants.length > 3 && (
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: '#EBE1CB',
                            color: '#8A7C66',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9.5,
                            fontWeight: 600,
                            ml: '-7px',
                            border: '1.5px solid #F7F1E3',
                        }}
                    >
                        +{participants.length - 3}
                    </Box>
                )}
            </Box>
            <Typography
                sx={{
                    width: 74,
                    textAlign: 'right',
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: '#2E2519',
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                }}
            >
                {item.unitPrice * (item.quantity || 1)} ₽
            </Typography>
        </Box>
    );
}

export default function ReceiptModal({
    open,
    onClose,
    items,
    setItems,
    usersOptions,
    onSave,
}) {
    const { total, perPerson } = computeTotals(items, usersOptions);

    const [addItemOpen, setAddItemOpen] = useState(false);
    const handleItemAdded = (newItem) => {
        setItems((prev) => [...prev, newItem]);
    };

    const [editItemOpen, setEditItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditItemOpen(true);
    };

    const handleItemSaved = (updated) => {
        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    };

    const handleItemDeleted = (id) => {
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const handleSaveClick = () => {
        onSave?.();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Transition}
            sx={{ '& .MuiDialog-container': { alignItems: 'flex-end' } }}
            slotProps={{
                paper: {
                    sx: {
                        m: 0,
                        width: '100%',
                        maxWidth: '100%',
                        borderRadius: '26px 26px 0 0',
                        backgroundColor: '#F7F1E3',
                        p: '10px 22px 24px',
                        maxHeight: '92%',
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
                    mb: 1.5,
                }}
            >
                <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#2E2519' }}>
                        Чек
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#8A7C66', mt: 0.25 }}>
                        {items.length} позиций
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#9C8B6F', mr: -0.5 }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    gap: 1.25,
                    pb: 1,
                    borderBottom: '1px solid #E2D6BC',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#A2947A',
                }}
            >
                <Typography sx={{ flex: 1, fontSize: 'inherit' }}>Позиция</Typography>
                <Typography sx={{ fontSize: 'inherit' }}>Делят</Typography>
                <Typography sx={{ width: 74, textAlign: 'right', fontSize: 'inherit' }}>
                    Сумма
                </Typography>
            </Box>

            {items.map((item) => (
                <ItemRow
                    key={item.id}
                    item={item}
                    usersOptions={usersOptions}
                    onEditClick={handleEditClick}
                />
            ))}

            <Button
                fullWidth
                onClick={() => setAddItemOpen(true)}
                sx={{
                    my: 1.5,
                    py: 1.25,
                    borderRadius: '11px',
                    border: '1px solid #C3B394',
                    color: '#2E2519',
                    fontSize: 13.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                        border: '1px solid #C3B394',
                        backgroundColor: '#F1E7D0',
                    },
                }}
            >
                ＋ Добавить позицию
            </Button>

            <Box sx={{ p: '15px', borderRadius: '14px', background: '#EFE6CF' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        mb: 1.25,
                    }}
                >
                    <Typography sx={{ fontSize: 12.5, color: '#7C6E58' }}>
                        Итого по чеку
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 23,
                            fontWeight: 700,
                            color: '#2E2519',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {total} ₽
                    </Typography>
                </Box>
                {usersOptions
                    .filter((u) => (perPerson[u.value] || 0) > 0)
                    .map((u) => (
                        <Box
                            key={u.value}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 12.5,
                                color: '#7C6E58',
                                py: 0.4,
                            }}
                        >
                            <span>{u.label}</span>
                            <span
                                style={{
                                    color: '#2E2519',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {(perPerson[u.value] || 0).toFixed(2)} ₽
                            </span>
                        </Box>
                    ))}
            </Box>

            <Button
                fullWidth
                onClick={handleSaveClick}
                sx={{
                    mt: 1.75,
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
                Сохранить чек
            </Button>

            <AddItem
                open={addItemOpen}
                onClose={() => setAddItemOpen(false)}
                usersOptions={usersOptions}
                onAdd={handleItemAdded}
            />
            <EditItem
                open={editItemOpen}
                onClose={() => setEditItemOpen(false)}
                item={editingItem}
                usersOptions={usersOptions}
                onSave={handleItemSaved}
                onDelete={handleItemDeleted}
            />
        </Dialog>
    );
}
