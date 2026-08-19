import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Meeting from './pages/Meeting';
import Home from './pages/Home';
import './App.css';
import { SnackbarProvider } from './components/SnackbarProvider';

function App() {
    return (
        <SnackbarProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/meetings/:meetingUUID" element={<Meeting />} />
                </Routes>
            </BrowserRouter>
        </SnackbarProvider>
    );
}

export default App;
