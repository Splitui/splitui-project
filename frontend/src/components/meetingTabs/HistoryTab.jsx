import { useMemo, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Avatar, Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { useSnackbar } from '../SnackbarProvider';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export default function HistoryTab() {
    const [changes, setChanges] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const showSnackbar = useSnackbar();
    const LIMIT = 10;

    const { meetingId } = useMemo(() => {
        const cookie = JSON.parse(Cookies.get('meeting') || '{}');
        return { meetingId: cookie.id };
    }, []);

    const fetchHistory = useCallback(
        async (newOffset = 0) => {
            if (!meetingId) return;
            try {
                const res = await fetch(
                    `${API_URL}/meetings/${meetingId}/changes?limit=${LIMIT}&offset=${newOffset}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    setHasMore(data.length === LIMIT);

                    setChanges((prev) => (newOffset === 0 ? data : [...prev, ...data]));
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    showSnackbar(
                        errorData.detail || 'Не удалось загрузить историю событий',
                    );
                }
            } catch (e) {
                showSnackbar('Ошибка сети при загрузке истории');
                console.error('Ошибка загрузки', e);
            }
        },
        [meetingId, showSnackbar],
    );

    useEffect(() => {
        const loadHistory = async () => {
            fetchHistory(0);
        };
        loadHistory();
    }, [fetchHistory]);

    const handleLoadMore = () => {
        const newOffset = offset + LIMIT;
        setOffset(newOffset);
        fetchHistory(newOffset);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex flex-col gap-4 mt-6 px-1">
            <div className="flex justify-between items-center px-2">
                <p className="text-[11px] font-bold tetx-[#8A7C66] uppercase ">
                    ИСТОРИЯ СОБЫТИЯ
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {changes.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 bg-white border border-[#E8DFC7] rounded-[24px]"
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: '#F8F4EC',
                                color: '#463628',
                            }}
                        >
                            <HistoryIcon sx={{ fontSize: 18 }} />
                        </Avatar>

                        <div className="flex flex-col flex-1 gap-1">
                            <p className="text-[14px] font-bold text-[#2E2519]">
                                {item.value.message}
                            </p>
                            <p className="text-[11px] text-[#8A7C66] font-medium">
                                {formatDate(item.created_at)}
                            </p>
                        </div>
                    </div>
                ))}

                {changes.length === 0 && (
                    <div className="text-center py-10 oracity-50">
                        <p>Событий нет</p>
                    </div>
                )}

                {hasMore && (
                    <div className="px-2 mt-2">
                        <Button
                            fullWidth
                            onClick={handleLoadMore}
                            className="!text-[#8A7C66] !font-bold !py-4 !rounded-[20px] !border !border-[#E8DFC7] !bg-[#FFFFFF]/50 hover:!bg-[#EBE1CB] !transition-all !normal-case !shadow-none"
                        >
                            Показать ещё
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
