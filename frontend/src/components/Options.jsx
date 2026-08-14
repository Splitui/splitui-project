export const FIELD_SX = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        '& fieldset': { borderColor: '#463628' },
        '&:hover fieldset': { borderColor: '#463628' },
        '&.Mui-focused fieldset': { borderColor: '#463628' },
    },
    '& label': { color: '#463628' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#463628 !important' },
    '& input': { color: '#463628' },
    '& .MuiSelect-select': { color: '#463628' },
};

export const MENU_PROPS = {
    slotProps: {
        paper: {
            sx: {
                backgroundColor: '#EAE0CD',
                '& .MuiMenuItem-root': { color: '#463628' },
                '& .MuiMenuItem-root.Mui-selected': {
                    backgroundColor: '#DAB672',
                },
                '& .MuiMenuItem-root.Mui-selected:hover': {
                    backgroundColor: '#c9a25f',
                },
                '& .MuiMenuItem-root:hover': {
                    backgroundColor: 'rgba(70, 54, 40, 0.08)',
                },
            },
        },
    },
};

export const CASHBACK_OPTIONS = [
    { value: 'food', label: 'Продукты' },
    { value: 'travel', label: 'Путешествия' },
];

export const BANKS = [
    { value: 1, label: 'Сбербанк' },
    { value: 2, label: 'Т-Банк' },
    { value: 3, label: 'Альфа-Банк' },
    { value: 4, label: 'ВТБ' },
];
