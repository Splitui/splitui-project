import {
    Dialog,
    IconButton,
    Button,
    Box,
    Typography,
    Avatar,
    AvatarGroup,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import AddItem from './AddItem';
import EditItem from './EditItem';

function computeTotals(items, usersOptions) {
    const total = items.reduce((sum, it) => sum + it.unitPrice, 0);

    const perPerson = {};
    usersOptions.forEach((u) => {
        perPerson[u.value] = 0;
    });

    items.forEach((it) => {
        const itemTotal = it.unitPrice;
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
            sx={{
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #463628',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'baseline', flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        color: '#463628',
                        fontWeight: 400,
                        fontSize: '18px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: 110,
                        flexShrink: 0,
                    }}
                >
                    {item.title}
                    {item.quantity > 1 ? ` x${item.quantity}` : ''}
                </Typography>
                <Typography sx={{ color: '#463628', fontWeight: 400, fontSize: '18px' }}>
                    {item.unitPrice} руб.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <AvatarGroup
                    max={3}
                    sx={{
                        '& .MuiAvatar-root': {
                            width: 35,
                            height: 35,
                            fontSize: 12,
                        },
                    }}
                >
                    {participants.map((p) => (
                        <Avatar key={p.value}>{p.label?.[0]?.toUpperCase()}</Avatar>
                    ))}
                </AvatarGroup>
                <IconButton size="small" onClick={() => onEditClick(item)}>
                    <EditIcon sx={{ color: '#463628', fontSize: '35px' }} />
                </IconButton>
            </Box>
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
    const handleAddItem = () => setAddItemOpen(true);
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
            fullScreen
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: '#EAE0CD',
                        p: { xs: 2, sm: 3 },
                        borderRadius: 3,
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
                        fontSize: '32px',
                        letterSpacing: '0.02em',
                    }}
                >
                    ЧЕК
                </Typography>
            </Box>

            <Box sx={{ mt: 1 }}>
                {items.map((item) => (
                    <ItemRow
                        key={item.id}
                        item={item}
                        usersOptions={usersOptions}
                        onEditClick={handleEditClick}
                    />
                ))}
            </Box>

            <Box sx={{ mt: 3 }}>
                <Typography sx={{ color: '#463628', fontWeight: 800, fontSize: '28px' }}>
                    ИТОГО:
                </Typography>
                <Typography sx={{ color: '#463628', fontWeight: 900, fontSize: '28px' }}>
                    {total} РУБ.
                </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: '#463628' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
                {usersOptions.map((u) => (
                    <Typography
                        key={u.value}
                        sx={{ color: '#463628', fontWeight: 800, fontSize: '26px' }}
                    >
                        {u.label} - {(perPerson[u.value] || 0).toFixed(2)} руб.
                    </Typography>
                ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddItem}
                    sx={{
                        backgroundColor: '#DAB672',
                        color: '#463628',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        py: 1.5,
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#c9a25f', boxShadow: 'none' },
                    }}
                >
                    ДОБАВИТЬ ПОЗИЦИЮ
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSaveClick}
                    sx={{
                        backgroundColor: '#463628',
                        color: '#FFF',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        py: 1.5,
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#463628', boxShadow: 'none' },
                    }}
                >
                    СОХРАНИТЬ
                </Button>
            </Box>

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
