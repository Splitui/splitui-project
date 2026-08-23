import { useEffect, useState } from 'react';
import { Tabs, Tab, Button, IconButton, Avatar, Drawer } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import EndMeeting from '../components/modal/EndMeeting';
import Cookies from 'js-cookie';
import UserModal from '../components/modal/UserModal';
import LastPageIcon from '@mui/icons-material/LastPage';
import EditMeeting from '../components/modal/EditMeeting';
import ExpensesTab from '../components/meetingTabs/ExpensesTab';
import PaymentTab from '../components/meetingTabs/PaymentTab';
import HistoryTab from '../components/meetingTabs/HistoryTab';
import UserAvatar from '../components/UserAvatar';
import AddExpense from '../components/modal/AddExpense';
import BestCashback from '../components/modal/BestCashback';
import EditExpense from '../components/modal/EditExpense';
import { useSnackbar } from '../components/SnackbarProvider';
import StatusRoomModal from '../components/modal/StatusRoomModal';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

const getParticipantWord = (count) => {
    const num = Math.abs(count) % 100;
    const num10 = num % 10;
    if (num >= 11 && num <= 19) return 'участников';
    if (num10 === 1) return 'участник';
    if (num10 >= 2 && num10 <= 4) return 'участника';
    return 'участников';
};
const STATUS_META = {
    active: { label: 'Активна', bg: '#DCEBD8', color: '#2F6B2A' },
    settle: { label: 'Оплата', bg: '#F6E7C4', color: '#8A5B12' },
    done: { label: 'Завершена', bg: '#E5DFD2', color: '#6B6153' },
};

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
    participantsCount,
    onMembersClick,
    onStatusClick,
    status = 'active',
}) => {
    const meta = STATUS_META[status] ?? STATUS_META.active;

    return (
        <header className="flex items-center gap-4 mb-6 shrink-0">
            <button
                onClick={() => navigate('/')}
                className="w-[42px] h-[42px] rounded-[14px] bg-[#EBE1CB] flex items-center justify-center text-2xl text-[#2E2519] shrink-0 transition-transform"
            >
                <LastPageIcon />
            </button>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                    <h1 className="text-[22px] sm:text-[25px] font-bold text-[#2E2519] truncate leading-none">
                        {name}
                    </h1>
                    {isCreator && (
                        <IconButton
                            size="small"
                            onClick={onEditClick}
                            sx={{ color: '#8A7C66', p: 0 }}
                        >
                            <EditIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={onStatusClick}
                        className="px-2 py-[3px] rounded-md text-[11px] font-bold tracking-wide uppercase leading-none"
                        style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                        {meta.label} ▾
                    </button>

                    <button
                        onClick={onMembersClick}
                        className="text-[13px] text-[#8A7C66] hover:text-[#463628] transition-colors truncate font-medium leading-none mt-[1px]"
                    >
                        {date ? date.split('-').reverse().join('.') : ''} ·{' '}
                        {participantsCount} {getParticipantWord(participantsCount)}
                    </button>
                </div>
            </div>

            <div className="shrink-0 flex items-center justify-center">
                <UserAvatar
                    user={user}
                    meetingId={meetingId}
                    participantId={participantId}
                    onSave={onSave}
                />
            </div>
        </header>
    );
};

const BalanceCard = ({ data }) => {
    const spend = data.participant_spend || 0;
    const debt = data.participant_debt || 0;
    const total = data.meeting_amount || 0;

    const netAmount = spend - debt;
    const amIOwed = netAmount >= 0;
    const net = Math.abs(netAmount);

    const heroLabel = amIOwed ? 'Вам должны' : 'Вы должны';
    const heroColor = amIOwed ? 'text-[#32935A]' : 'text-[#C12D2D]';

    return (
        <div className="w-full text-left px-5 shrink-0 mt-4">
            <div className="text-[11.5px] tracking-[0.08em] uppercase text-[#9C8B6F] font-bold">
                {heroLabel}
            </div>

            <div
                className={`text-[40px] font-bold tracking-tight mt-1 tabular-nums leading-none ${heroColor}`}
            >
                {net.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}{' '}
                <span className="text-[30px] ml-0.5">₽</span>
            </div>

            <div className="flex gap-4 mt-3 text-[13px] text-[#8A7C66] font-medium">
                <span>
                    Всего{' '}
                    <span className="text-[#2E2519] tabular-nums">
                        {total.toFixed(2)} ₽
                    </span>
                </span>
            </div>
        </div>
    );
};

const MeetingTabs = ({ value, onChange }) => (
    <div className="px-5 mt-4 shrink-0">
        <Tabs
            value={value}
            onChange={onChange}
            variant="fullWidth"
            sx={{
                minHeight: '48px',
                backgroundColor: '#E8DFC7',
                borderRadius: '14px',
                p: '4px',
                '& .MuiTabs-indicator': {
                    display: 'none',
                },
                '& .MuiTabs-flexContainer': {
                    gap: '4px',
                },
            }}
        >
            <Tab
                value="expenses"
                label="Расходы"
                sx={{
                    minHeight: '40px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    borderRadius: '11px',
                    color: '#8A7C66',
                    transition: '0.2s',
                    '&.Mui-selected': {
                        backgroundColor: '#FFFFFF',
                        color: '#2E2519',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                }}
            />
            <Tab
                value="payment"
                label="Оплата"
                sx={{
                    minHeight: '40px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    borderRadius: '11px',
                    color: '#8A7C66',
                    transition: '0.2s',
                    '&.Mui-selected': {
                        backgroundColor: '#FFFFFF',
                        color: '#2E2519',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                }}
            />
            <Tab
                value="history"
                label="История"
                sx={{
                    minHeight: '40px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    borderRadius: '11px',
                    color: '#8A7C66',
                    transition: '0.2s',
                    '&.Mui-selected': {
                        backgroundColor: '#FFFFFF',
                        color: '#2E2519',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                }}
            />
        </Tabs>
    </div>
);

const MembersDialog = ({
    open,
    onClose,
    participants,
    meetingId,
    onSave,
    roomStatus,
}) => {
    const [editOpen, setEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const showSnackbar = useSnackbar();

    const meetingCookie = JSON.parse(Cookies.get('meeting') || '{}');
    const myParticipantId = meetingCookie.participantId;
    const iAmCreator = meetingCookie.isCreator;

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setEditOpen(true);
    };

    const handleLink = async () => {
        const inviteLink = `${window.location.origin}?join=${meetingId}`;
        await navigator.clipboard.writeText(inviteLink);
        showSnackbar('Ссылка скопирована!', 'success');
    };

    return (
        <>
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                slotProps={{
                    paper: {
                        sx: {
                            borderTopLeftRadius: '32px',
                            borderTopRightRadius: '32px',
                            backgroundColor: '#F7F1E3',
                            backgroundImage: 'none',
                            width: '100%',
                            maxWidth: '100%',
                            margin: 0,
                        },
                    },
                }}
            >
                <div className="w-12 h-1.5 bg-[#D9D3C7] rounded-full mx-auto mt-3 mb-1" />

                <div className="flex justify-between items-center px-6 pt-4 pb-2">
                    <h2 className="text-[24px] font-bold text-[#2E2519]">Участники</h2>
                    <IconButton onClick={onClose} sx={{ color: '#8A7C66', p: 0.5 }}>
                        <CloseIcon sx={{ fontSize: '28px', fontWeight: 300 }} />
                    </IconButton>
                </div>

                <div className="px-6 pb-8 overflow-y-auto">
                    <Button
                        fullWidth
                        onClick={handleLink}
                        sx={{
                            py: 1.8,
                            borderRadius: '16px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E8DFC7',
                            color: '#2E2519',
                            fontWeight: '600',
                            fontSize: '15px',
                            textTransform: 'none',
                            justifyContent: 'center',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#fdfdfd',
                                borderColor: '#D4C9B0',
                            },
                        }}
                    >
                        + Добавить участника
                    </Button>

                    <div className="text-[11px] uppercase tracking-wider text-[#9C8B6F] font-bold mb-2 mt-6">
                        Список участников
                    </div>

                    <div className="flex flex-col gap-3">
                        {participants.map((p, idx) => {
                            const isMe = p.id === myParticipantId;
                            const isCreator = isMe ? iAmCreator : p.is_creator;
                            return (
                                <div
                                    key={idx}
                                    onClick={() =>
                                        (roomStatus !== 'active' || isMe) &&
                                        handleUserClick(p)
                                    }
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E8DFC7] transition-all cursor-pointer"
                                >
                                    <Avatar
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            bgcolor: '#E6D9BA',
                                            color: '#7A5316',
                                            fontWeight: 'bold',
                                            fontSize: '18px',
                                        }}
                                    >
                                        {p.nickname ? p.nickname[0].toUpperCase() : '?'}
                                    </Avatar>

                                    <div className="flex flex-col flex-1">
                                        <span className="font-bold text-[#2E2519] text-[17px]">
                                            {p.nickname} {isMe && '(вы)'}
                                        </span>
                                        <span className="text-[13px] text-[#8A7C66]">
                                            {isCreator ? 'Создатель встречи' : 'Участник'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                    <Button
                        fullWidth
                        onClick={onClose}
                        sx={{
                            py: 2,
                            borderRadius: '20px',
                            backgroundColor: '#2E2519',
                            color: '#F7F1E3',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#463628' },
                        }}
                    >
                        Готово
                    </Button>
                </div>
            </Drawer>

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
                roomStatus={roomStatus}
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
    const [refresh, setRefresh] = useState(0);
    const [editExpenseId, setEditExpenseId] = useState(null);
    const [openStatus, setOpenStatus] = useState(false);
    const navigate = useNavigate();
    const meeting = JSON.parse(Cookies.get('meeting') || '{}');
    const meetingId = meeting.id;
    const participantId = meeting.participantId;
    const [isFinished, setIsFinished] = useState(false);
    const showSnackbar = useSnackbar();
    const roomStatus = isFinished ? 'done' : meeting.status || 'active';
    const isLocked = roomStatus !== 'active';

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

    const [openBestCashback, setOpenBestCashback] = useState(false);

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
                    {
                        headers: { 'session-id': meeting.sessionId },
                    },
                );
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data);
                }
            } catch (e) {
                showSnackbar('Ошибка загрузки данных', e);
            }
        };
        fetchBalance();
    }, [meetingId, participantId, refresh, showSnackbar, meeting.sessionId, refresh]);

    useEffect(() => {
        const fetchParticipants = async () => {
            if (!meetingId) return;
            try {
                const res = await fetch(
                    `${API_URL}/meetings/${meetingId}/participants?limit=50&offset=0`,
                    {
                        headers: { 'session-id': meeting.sessionId },
                    },
                );
                if (res.ok) {
                    const participants = await res.json();
                    const fullDataParticipants = await Promise.all(
                        participants.map(async (p) => {
                            try {
                                const bankRes = await fetch(
                                    `${API_URL}/meetings/${meetingId}/participants/${p.id}/bank_data`,
                                    {
                                        headers: { 'session-id': meeting.sessionId },
                                    },
                                );
                                if (bankRes.ok) {
                                    const bankData = await bankRes.json();
                                    const enriched = {
                                        ...p,
                                        card_number: bankData.card_number,
                                        phone_number: bankData.phone_number,
                                        bank_id: bankData.bank_id,
                                        bank_name: bankData.bank_name,
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
                                                sessionId: meetingCookie.sessionId,
                                            }),
                                        );
                                    }
                                    return enriched;
                                }
                            } catch (err) {
                                showSnackbar('Ошибка загрузки данных', err);
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
    }, [meetingId, participantId, showSnackbar, meeting.sessionId]);

    useEffect(() => {
        const checkMeetingStatus = async () => {
            if (!meetingId) return;
            try {
                const res = await fetch(`${API_URL}/meetings/${meetingId}`, {
                    headers: { 'session-id': meeting.sessionId },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'Завершена' || data.is_finished) {
                        setIsFinished(true);
                    }

                    if (data.title) setCurrentMeetingName(data.title);
                    if (data.start_date)
                        setCurrentMeetingDate(data.start_date.substring(0, 10));
                }
            } catch (e) {
                console.error('Ошибка проверки статуса', e);
            }
        };
        checkMeetingStatus();
    }, [meetingId, meeting.sessionId]);

    const handleFinishMeetingAPI = async () => {
        try {
            const cookie = JSON.parse(Cookies.get('meeting') || '{}');
            const res = await fetch(`${API_URL}/meetings/${meetingId}/finish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'session-id': cookie.sessionId,
                },
            });
            if (res.ok) {
                setIsFinished(true);
                setOpenEndMeeting(false);
            } else {
                alert('Не удалось завершить встречу');
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка сети');
        }
    };
    const handleStatusChange = async (newStatus) => {
        const cookie = JSON.parse(Cookies.get('meeting') || '{}');
        const endpointByStatus = {
            active: 'edit',
            settle: 'calculate',
            done: 'finish',
        };
        const action = endpointByStatus[newStatus];
        if (!action) return;

        try {
            const res = await fetch(`${API_URL}/meetings/${meetingId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'session-id': cookie.sessionId,
                },
            });
            if (!res.ok) {
                showSnackbar('Не удалось изменить статус');
                return;
            }
            Cookies.set('meeting', JSON.stringify({ ...cookie, status: newStatus }));
            if (newStatus === 'done') setIsFinished(true);
            setRefresh((n) => n + 1);
            showSnackbar('Статус обновлён', 'success');
        } catch (e) {
            showSnackbar('Сеть недоступна', e);
        }
    };

    const handleBottomButtonClick = () => {
        if (value === 'expenses') {
            setOpenAddExpense(true);
        } else {
            setOpenEndMeeting(true);
        }
    };
    return (
        <div className="h-screen bg-[#F7F1E3] flex flex-col items-center overflow-hidden font-sans">
            <div className="w-full max-w-4xl flex flex-col h-full p-4 md:p-8">
                <MeetingHeader
                    navigate={navigate}
                    name={currentMeetingName}
                    date={currentMeetingDate}
                    user={currentUser}
                    meetingId={meetingId}
                    participantId={participantId}
                    participantsCount={participants.length}
                    isCreator={meeting.isCreator}
                    onEditClick={() => setOpenEditMeeting(true)}
                    onSave={(data) => handleUpdateParticipant(data, participantId)}
                    onMembersClick={() => setOpenMembers(true)}
                    onStatusClick={() => setOpenStatus(true)}
                    status={roomStatus}
                />

                <BalanceCard data={balance} />

                <MeetingTabs value={value} onChange={handleChange} />

                <main className="flex-1 overflow-y-auto custom-scrollbar px-2">
                    {value === 'expenses' && (
                        <ExpensesTab
                            refresh={refresh}
                            onExpenseClick={setEditExpenseId}
                            participants={participants}
                            participantId={participantId}
                        />
                    )}
                    {value === 'payment' && (
                        <PaymentTab
                            onUpdate={() => setRefresh((n) => n + 1)}
                            participants={participants}
                            refresh={refresh}
                        />
                    )}
                    {value === 'history' && <HistoryTab />}
                </main>

                <div className="pt-4 shrink-0">
                    {value === 'expenses' ? (
                        <Button
                            onClick={() => setOpenBestCashback(true)}
                            variant="contained"
                            fullWidth
                            disabled={isLocked}
                            sx={{
                                backgroundColor: '#ffffff',
                                color: '#463628',
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                py: 2,
                                fontSize: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    backgroundColor: '#E8DFC7',
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

                {value !== 'history' && (
                    <div className="pt-4 shrink-0">
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={isLocked ? null : handleBottomButtonClick}
                            disabled={isLocked && value === 'expenses'}
                            sx={{
                                backgroundColor: isLocked
                                    ? '#F8F4EC !important'
                                    : '#32281E',
                                color: isLocked ? '#757575 !important' : '#EAE0CD',
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                py: 2,
                                fontSize: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                boxShadow: 'none',
                                '&.Mui-disabled': {
                                    backgroundColor: '#CCCCCC',
                                    color: '#888888',
                                },
                            }}
                        >
                            {isFinished
                                ? 'Встреча завершена'
                                : roomStatus === 'calculating'
                                  ? 'Идет расчет...'
                                  : value === 'expenses'
                                    ? 'Добавить расход'
                                    : 'Завершить встречу'}
                        </Button>
                    </div>
                )}

                <MembersDialog
                    className="#F8F4EC"
                    open={openMembers}
                    onClose={() => setOpenMembers(false)}
                    roomStatus={roomStatus}
                    participants={participants}
                    meetingId={meetingId}
                    onSave={(data) =>
                        handleUpdateParticipant(data, data.id || participantId)
                    }
                />
                <StatusRoomModal
                    open={openStatus}
                    onClose={() => setOpenStatus(false)}
                    status={roomStatus}
                    creatorName={currentUser?.nickname}
                    canChange={meeting.isCreator}
                    onChange={handleStatusChange}
                />
                <AddExpense
                    open={openAddExpense}
                    onClose={() => setOpenAddExpense(false)}
                    onCreated={() => setRefresh((n) => n + 1)}
                />
                <EditExpense
                    open={editExpenseId !== null}
                    expenseId={editExpenseId}
                    onClose={() => setEditExpenseId(null)}
                    onUpdated={() => setRefresh((n) => n + 1)}
                />
                <EndMeeting
                    open={openEndMeeting}
                    onClose={() => setOpenEndMeeting(false)}
                    onConfirm={handleFinishMeetingAPI}
                />

                <BestCashback
                    open={openBestCashback}
                    onClose={() => setOpenBestCashback(false)}
                    participants={participants}
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
