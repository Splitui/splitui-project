import { useState } from 'react';
import {
    Tabs,
    Tab,
    Button,
    IconButton,
    Avatar,
    AvatarGroup,
    Dialog,
    DialogContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import leave from '../components/logo/leave.svg';
import Cookies from 'js-cookie';
import ExpensesTab from '../components/meetingTabs/ExpensesTab';
import PaymentTab from '../components/meetingTabs/PaymentTab';
import UserAvatar from '../components/UserAvatar';

const MeetingHeader = ({ navigate, name, date, userName }) => (
    <header className="flex justify-between items-start mb-6 shrink-0">
        <IconButton onClick={() => navigate('/')}>
            <img src={leave} alt="leave" className="w-12 h-12 object-contain" />
        </IconButton>
        <div className="text-center flex-1 mx-2">
            <h1 className="font-bold text-xl text-[#4A3F35] leading-tight">{name}</h1>
            <p className="text-sm text-[#4A3F35] opacity-70">{date}</p>
        </div>
        <UserAvatar userName={userName} />
    </header>
);

const MeetingTabs = ({ value, onChange }) => (
    <div className="mb-6 shrink-0">
        <Tabs
            value={value}
            onChange={onChange}
            variant="fullWidth"
            sx={{ '& .MuiTabs-indicator': { display: 'none' } }}
        >
            <Tab
                value="expenses"
                label="Расходы"
                sx={{
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    textTransform: 'none',
                    backgroundColor: value === 'expenses' ? '#EAE0CD' : '#463628',
                    color: value === 'expenses' ? '#463628' : '#EAE0CD',
                    '&.Mui-selected': {
                        backgroundColor: '#DAB672',
                        color: '#463628',
                    },
                }}
            />
            <Tab
                value="payment"
                label="Оплата"
                sx={{
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    textTransform: 'none',
                    backgroundColor: value === 'payment' ? '#EAE0CD' : '#463628',
                    color: value === 'payment' ? '#463628' : '#EAE0CD',
                    '&.Mui-selected': {
                        backgroundColor: '#DAB672',
                        color: '#463628',
                    },
                }}
            />
        </Tabs>
    </div>
);

const BalanceCard = () => (
    <div className="bg-[#F8F4EC] w-full max-w-[332px] md:max-w-none min-h-[130px] rounded-[25px] p-4 shadow-sm flex flex-col gap-2 shrink-0">
        <div className="flex justify-between items-center">
            <span className="font-bold text-[#463628] uppercase text-sm md:text-base tracking-tight">
                Всего потрачено:
            </span>
            <span className="text-[#DAB672] font-black text-xl md:text-2xl">
                65840,34
            </span>
        </div>
        <div className="flex justify-between items-center">
            <span className="font-bold text-[#463628] uppercase text-sm md:text-base tracking-tight">
                Должен я:
            </span>
            <span className="text-[#DAB672] font-black text-xl md:text-2xl">
                15743,55
            </span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-50 pt-1">
            <span className="font-bold text-[#463628] uppercase text-sm md:text-base tracking-tight">
                Должны мне:
            </span>
            <span className="text-[#DAB672] font-black text-xl md:text-2xl">2500,00</span>
        </div>
    </div>
);

const MembersButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="bg-[#F8F4EC] w-[70%] max-w-[280px] h-[56px] rounded-[15px] p-4 flex justify-between items-center shadow-sm active:scale-[0.98] transition-all shrink-0"
    >
        <span className="font-bold text-base uppercase text-[#463628]">Участники</span>
        <AvatarGroup
            max={3}
            sx={{
                '& .MuiAvatar-root': {
                    width: 30,
                    height: 30,
                    fontSize: 12,
                    border: '2px solid #F8F4EC',
                },
            }}
        >
            <Avatar>Г</Avatar>
            <Avatar>К</Avatar>
        </AvatarGroup>
    </button>
);

const MembersDialog = ({ open, onClose }) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <div className="flex justify-between p-4">
            <h2 className="text-xl font-bold text-[#463628]">Список участников</h2>
            <button onClick={onClose} className="text-2xl font-bold">
                ☓
            </button>
        </div>
        <DialogContent>
            <div className="flex flex-col gap-3 pb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Avatar>Г</Avatar>
                    <span className="font-bold text-[#463628]">Галилео Галилей</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Avatar>К</Avatar>
                    <span className="font-bold text-[#463628]">Канеки Кен</span>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

export default function Meeting() {
    const [value, setValue] = useState('expenses');
    const [openMembers, setOpenMembers] = useState(false);
    const navigate = useNavigate();

    const meetingName = Cookies.get('meetingName') || 'Встреча сплитуев';
    const rawDate = Cookies.get('meetingDate') || '';
    const meetingDate = rawDate ? rawDate.split('-').reverse().join('.') : '';
    const userName = Cookies.get('adminName') || 'Юзер';

    const handleChange = (_, newValue) => setValue(newValue);

    return (
        <div className="h-screen bg-[#E8DCC4] flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-4xl flex flex-col h-full p-4 md:p-8">
                <MeetingHeader
                    navigate={navigate}
                    name={meetingName}
                    date={meetingDate}
                    userName={userName}
                />

                <MeetingTabs value={value} onChange={handleChange} />

                <div className="flex flex-col gap-6 mb-8 items-center">
                    <BalanceCard />
                    <MembersButton onClick={() => setOpenMembers(true)} />
                </div>

                <main className="flex-1 overflow-y-auto custom-scrollbar px-2">
                    {value === 'expenses' ? <ExpensesTab /> : <PaymentTab />}
                </main>

                <div className="pt-4 shrink-0">
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: '#463628',
                            color: '#EAE0CD',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            py: 2,
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                            '&:hover': {
                                backgroundColor: '#3a2c20',
                                boxShadow: '0px 6px 10px rgba(0,0,0,0.2)',
                            },
                        }}
                    >
                        {value === 'expenses' ? 'Добавить расход' : 'Оплатить'}
                    </Button>
                </div>

                <MembersDialog
                    className="#F8F4EC"
                    open={openMembers}
                    onClose={() => setOpenMembers(false)}
                />
            </div>
        </div>
    );
}
