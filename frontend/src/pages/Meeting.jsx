import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import Cookies from 'js-cookie';
import MembersTab from '../components/meetingTabs/MembersTab';
import ReceiptsTab from '../components/meetingTabs/ReceiptsTab';
import UserAvatar from '../components/UserAvatar';

export default function Meeting() {
    const [value, setValue] = useState('members');

    const meetingName = Cookies.get('meetingName') || 'Встреча сплитуев';
    const meetingDate = Cookies.get('meetingDate') || '';
    const userName = Cookies.get('adminName') || 'Юзер';

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className="min-h-screen pb-20">
            <header className="flex justify-between items-center p-4 border-black bg-white">
                <h1 className="font-bold text-lg">
                    {meetingName} {meetingDate}
                </h1>
                <UserAvatar userName={userName} />
            </header>
            <main>
                {value === 'members' && <MembersTab />}{' '}
                {value === 'receipts' && <ReceiptsTab />}
            </main>
            <nav className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-black z-50">
                <Tabs value={value} onChange={handleChange} variant="fullWidth">
                    <Tab value="members" label="Участники" className="font-bold py-5" />
                    <Tab value="receipts" label="Чеки" className="font-bold py-5" />
                </Tabs>
            </nav>
        </div>
    );
}
