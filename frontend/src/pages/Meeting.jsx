import { useEffect, useState } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import leave from '../components/logo/leave.svg';
import EndMeeting from '../components/modal/EndMeeting';
import Cookies from 'js-cookie';
import UserModal from '../components/modal/UserModal';
import EditMeeting from '../components/modal/EditMeeting';
import ExpensesTab from '../components/meetingTabs/ExpensesTab';
import PaymentTab from '../components/meetingTabs/PaymentTab';
import UserAvatar from '../components/UserAvatar';
import AddExpense from '../components/modal/AddExpense';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const MeetingHeader = ({
    navigate,
    name,
    date,
    user,
    meetingId,
    participantId,
    onSave,
    onEditClick,
    isCreator,
}) => (
    <header className="flex justify-between items-start mb-6 shrink-0">
        <IconButton onClick={() => navigate('/')}>
            <img src={leave} alt="leave" className="w-12 h-12 object-contain" />
        </IconButton>
        <div className="flex-1 flex justify-center items-center gap-1 ml-4">
            <div className="text-center">
                <h1 className="font-bold text-xl text-[#4A3F35] leading-tight">{name}</h1>
                <p className="text-sm text-[#4A3F35] opacity-70">
                    {date ? date.split('-').reverse().join('.') : ''}
                </p>
            </div>

            {isCreator && (
                <IconButton
                    size="small"
                    onClick={onEditClick}
                    sx={{ color: '#4A3F35', opacity: 0.6, mt: -1 }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            )}
        </div>
        <UserAvatar
            user={user}
            meetingId={meetingId}
            participantId={participantId}
            onSave={onSave}
        />
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
                    backgroundColor: value === 'expenses' ? '#463628' : '#DAB672',
                    color: value === 'expenses' ? '#EAE0CD' : '#463628',
                    '&.Mui-selected': {
                        backgroundColor: '#463628',
                        color: '#EAE0CD',
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
                    backgroundColor: value === 'payment' ? '#463628' : '#DAB672',
                    color: value === 'payment' ? '#EAE0CD' : '#463628',
                    '&.Mui-selected': {
                        backgroundColor: '#463628',
                        color: '#EAE0CD',
                    },
                }}
            />
        </Tabs>
    </div>
);

const BalanceCard = ({ data }) => (
    <div className="bg-[#F8F4EC] w-full max-w-[332px] md:max-w-none min-h-[130px] rounded-[25px] p-4 shadow-sm flex flex-col gap-2 shrink-0">
        <div className="flex justify-between items-center">
            <span className="font-bold text-[#463628] uppercase text-sm md:text-base tracking-tight">
                Всего потрачено:
            </span>
            <span className="text-[#DAB672] font-black text-xl md:text-2xl">
                {data.meeting_amount}
            </span>
        </div>
        <div className="flex justify-between items-center">
            <span className="font-bold text-[#463628] uppercase text-sm md:text-base tracking-tight">
                Должен я:
            </span>
            <span className="text-[#DAB672] font-black text-xl md:text-2xl">
                {data.participant_debt}
            </span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-50 pt-1">
            <span className="font-bold text-[#463628] uppercase text-sm md:text-base tracking-tight">
                Должны мне:
            </span>
            <span className="text-[#DAB672] font-black text-xl md:text-2xl">
                {data.participant_spend}
            </span>
        </div>
    </div>
);

const MembersButton = ({ onClick, participants }) => (
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
            {participants.map((p, idx) => (
                <Avatar key={idx}>
                    {p.nickname ? p.nickname[0].toUpperCase() : '?'}
                </Avatar>
            ))}
        </AvatarGroup>
    </button>
);

const MembersDialog = ({ open, onClose, participants, meetingId, onSave }) => {
    const [editOpen, setEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const meetingCookie = JSON.parse(Cookies.get('meeting') || '{}');
    const myParticipantId = meetingCookie.participantId;

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setEditOpen(true);
    };
    const handleLink = async () => {
        const inviteLink = `${window.location.origin}?join=${meetingId}`;
        await navigator.clipboard.writeText(inviteLink);
        alert('Успешно скопировано');
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
                <div className="flex justify-between p-4">
                    <h2 className="text-xl font-bold text-[#463628]">
                        Список участников
                    </h2>
                    <IconButton onClick={onClose} className="text-2xl font-bold">
                        ☓
                    </IconButton>
                </div>
                <DialogContent>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleLink}
                        sx={{
                            mb: 3,
                            py: 1.5,
                            borderRadius: '12px',
                            border: '2px solid #463628',
                            color: '#463628',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            '&:hover': {
                                border: '2px solid #463628',
                                backgroundColor: '#F8F4EC',
                            },
                            '&.MuiButton-outlined': {
                                borderColor: '#463628',
                            },
                        }}
                    >
                        Добавить участника
                    </Button>
                    <div className="flex flex-col gap-3 pb-4">
                        {participants.length > 0 ? (
                            participants.map((p, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleUserClick(p)}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100"
                                >
                                    <Avatar>
                                        {p.nickname ? p.nickname[0].toUpperCase() : '?'}
                                    </Avatar>
                                    <span className="font-bold text-[#463628]">
                                        {p.nickname}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <h3>Пусто</h3>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <UserModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                user={selectedUser}
                meetingUUID={meetingId}
                participantId={selectedUser?.id || myParticipantId}
                onSave={(data) => {
                    if (onSave)
                        onSave({ ...data, id: selectedUser?.id || myParticipantId });
                }}
                isEditable={selectedUser?.id === myParticipantId}
            />
        </>
    );
};

export default function Meeting() {
    const [openEndMeeting, setOpenEndMeeting] = useState(false);
    const [value, setValue] = useState('expenses');
    const [openMembers, setOpenMembers] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [openAddExpense, setOpenAddExpense] = useState(false);
    const navigate = useNavigate();
    const meeting = JSON.parse(Cookies.get('meeting') || '{}');
    const meetingId = meeting.id;
    const participantId = meeting.participantId;

    const [currentMeetingName, setCurrentMeetingName] = useState(
        meeting.name || 'Встреча сплитуев',
    );
    const [currentMeetingDate, setCurrentMeetingDate] = useState(meeting.date || '');
    const [openEditMeeting, setOpenEditMeeting] = useState(false);

    const [balance, setBalance] = useState({
        meeting_amount: 0,
        participant_debt: 0,
        participant_spend: 0,
    });

    const currentUser = participants.find((p) => p.id === participantId) || {
        nickname: meeting.userName || `Юзер`,
        id: participantId,
        card_number: meeting.card_number || '',
        phone_number: meeting.phone_number || '',
        bank_id: meeting.bank_id || 1,
    };

    const handleChange = (_, newValue) => setValue(newValue);

    const handleUpdateParticipant = (updatedData, participantId) => {
        setParticipants((prev) =>
            prev.map((p) => (p.id === participantId ? { ...p, ...updatedData } : p)),
        );
    };

    useEffect(() => {
        const fetchBalance = async () => {
            if (!meetingId || !participantId) return;
            try {
                const res = await fetch(
                    `${API_URL}/amount/${meetingId}/${participantId}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data);
                }
            } catch (e) {
                console.error('Ошибочка с балансом', e);
            }
        };
        fetchBalance();
    }, [meetingId, participantId]);

    useEffect(() => {
        const fetchParticipants = async () => {
            if (!meetingId) return;
            try {
                const res = await fetch(
                    `${API_URL}/meetings/${meetingId}/participants?limit=50&offset=0`,
                );
                if (res.ok) {
                    const participants = await res.json();
                    const fullDataParticipants = await Promise.all(
                        participants.map(async (p) => {
                            try {
                                const bankRes = await fetch(
                                    `${API_URL}/meetings/${meetingId}/participants/${p.id}/bank_data`,
                                );
                                if (bankRes.ok) {
                                    const bankData = await bankRes.json();
                                    const enriched = {
                                        ...p,
                                        card_number: bankData.card_number,
                                        phone_number: bankData.phone_number,
                                        bank_id: bankData.bank_id,
                                    };
                                    if (p.id === participantId) {
                                        const meetingCookie = JSON.parse(
                                            Cookies.get('meeting') || '{}',
                                        );
                                        Cookies.set(
                                            'meeting',
                                            JSON.stringify({
                                                id: meetingCookie.id,
                                                participantId:
                                                    meetingCookie.participantId,
                                                userName: enriched.nickname,
                                                card_number: enriched.card_number,
                                                phone_number: enriched.phone_number,
                                                bank_id: enriched.bank_id,
                                                isCreator: meetingCookie.isCreator,
                                                name: meetingCookie.name,
                                                date: meetingCookie.date,
                                            }),
                                        );
                                    }
                                    return enriched;
                                }
                            } catch (err) {
                                console.log('Нет данных банка для', p.id, err);
                            }
                            return p;
                        }),
                    );
                    setParticipants(fullDataParticipants);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchParticipants();
    }, [meetingId, participantId]);

    const handleBottomButtonClick = () => {
        if (value === 'expenses') {
            setOpenAddExpense(true);
        } else {
            setOpenEndMeeting(true);
        }
    };
    return (
        <div className="h-screen bg-[#E8DCC4] flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-4xl flex flex-col h-full p-4 md:p-8">
                <MeetingHeader
                    navigate={navigate}
                    name={currentMeetingName}
                    date={currentMeetingDate}
                    user={currentUser}
                    meetingId={meetingId}
                    participantId={participantId}
                    isCreator={meeting.isCreator}
                    onEditClick={() => setOpenEditMeeting(true)}
                    onSave={(data) => handleUpdateParticipant(data, participantId)}
                />

                <MeetingTabs value={value} onChange={handleChange} />

                <div className="flex flex-col gap-6 mb-8 items-center">
                    <BalanceCard data={balance} />
                    <MembersButton
                        onClick={() => setOpenMembers(true)}
                        participants={participants}
                    />
                </div>

                <main className="flex-1 overflow-y-auto custom-scrollbar px-2">
                    {value === 'expenses' ? <ExpensesTab /> : <PaymentTab />}
                </main>

                <div className="pt-4 shrink-0">
                    {value === 'expenses' ? (
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                backgroundColor: '#DAB672',
                                color: '#463628',
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                py: 2,
                                fontSize: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    backgroundColor: '#c5a363',
                                    boxShadow: '0px 6px 10px rgba(0,0,0,0.2)',
                                },
                            }}
                        >
                            ЛУЧШИЙ КЭШБЭК
                        </Button>
                    ) : (
                        ''
                    )}
                </div>

                <div className="pt-4 shrink-0">
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleBottomButtonClick}
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
                        {value === 'expenses' ? 'Добавить расход' : 'Завершить встречу'}
                    </Button>
                </div>

                <MembersDialog
                    className="#F8F4EC"
                    open={openMembers}
                    onClose={() => setOpenMembers(false)}
                    participants={participants}
                    meetingId={meetingId}
                    onSave={(data) =>
                        handleUpdateParticipant(data, data.id || participantId)
                    }
                />
                <AddExpense
                    open={openAddExpense}
                    onClose={() => setOpenAddExpense(false)}
                />

                <EndMeeting
                    open={openEndMeeting}
                    onClose={() => setOpenEndMeeting(false)}
                    onConfirm={() => {
                        alert('Встреча завершена!');
                        setOpenEndMeeting(false);
                    }}
                />

                <EditMeeting
                    open={openEditMeeting}
                    onClose={() => setOpenEditMeeting(false)}
                    meetingId={meetingId}
                    meetingName={currentMeetingName}
                    meetingDate={currentMeetingDate}
                    onSave={(newName, newDate) => {
                        setCurrentMeetingName(newName);
                        setCurrentMeetingDate(newDate);
                    }}
                />
            </div>
        </div>
    );
}
