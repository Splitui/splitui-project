import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext(null);

export const useSnackbar = () => useContext(SnackbarContext);

export function SnackbarProvider({ children }) {
    const [state, setState] = useState({
        open: false,
        message: '',
        severity: 'error',
    });

    const showSnackbar = useCallback((message, severity = 'error') => {
        setState({ open: true, message, severity });
    }, []);

    const handleClose = () => setState((s) => ({ ...s, open: false }));

    return (
        <SnackbarContext.Provider value={showSnackbar}>
            {children}
            <Snackbar
                open={state.open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={state.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {state.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}
