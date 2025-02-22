import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const CustomSnackbar = ({ open, onClose, message, severity = 'info' }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}  // Changed to right
            sx={{
                marginTop: '20px',  // Add some top margin
                marginRight: '20px' // Add some right margin
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                elevation={6}
                sx={{
                    width: '100%',
                    minWidth: '300px',  // Ensure minimum width
                    backgroundColor: severity === 'success' ? '#43a047' :
                        severity === 'error' ? '#d32f2f' :
                            severity === 'warning' ? '#ffa000' : '#2196f3',
                    '& .MuiAlert-icon': {
                        fontSize: '24px'
                    },
                    '& .MuiAlert-message': {
                        fontSize: '16px'
                    }
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default CustomSnackbar;
