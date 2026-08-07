import { useEffect, useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useParams } from 'react-router-dom';
import MembersTab from '../components/meetingTabs/MembersTab';
import ReceiptsTab from '../components/meetingTabs/ReceiptsTab';

export default function Meeting() {
    const [value, setValue] = useState('members');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const { meetingUUID } = useParams();

    useEffect(() => {
        console.log('Айди встречи: ' + meetingUUID);
    }, [meetingUUID]);

    return (
        <div className="min-h-screen pb-20">
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
