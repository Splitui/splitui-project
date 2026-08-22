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
    { id: 'supermarkets', label: 'СУПЕРМАРКЕТЫ', value: 5 },
    { id: 'gas', label: 'АЗС', value: 5 },
    { id: 'transport', label: 'ТРАНСПОРТ', value: 5 },
    { id: 'entertainment', label: 'РАЗВЛЕЧЕНИЯ', value: 5 },
];

export const BANKS = [
    { value: 1, label: 'Сбербанк' },
    { value: 2, label: 'Альфа-Банк' },
    { value: 3, label: 'ВТБ' },
    { value: 4, label: 'Т-Банк' },
    { value: 5, label: 'Райффайзен Банк' },
    { value: 6, label: 'OZON банк' },
];

export const PAYMENTS = [
    { id: 1, name: 'Вивальди', action: 'получение', amount: '5648,67' },
    { id: 2, name: 'Моцарт', action: 'оплата', amount: '5153,00' },
    { id: 3, name: 'Галилео', action: 'получение', amount: '1200,00' },
    { id: 4, name: 'Канеки', action: 'оплата', amount: '340,00' },
    { id: 5, name: 'Юзер', action: 'оплата', amount: '150,00' },
];
