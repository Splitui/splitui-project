import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Meeting from './pages/Meeting';
import Home from './pages/Home';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/meeting/:meetingUUID" element={<Meeting />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
