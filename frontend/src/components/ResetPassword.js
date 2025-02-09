
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { resetPassword } from '../services/api';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await resetPassword({
                token,
                email,
                password
            });
            if (response.message) {
                setMessage('Password reset successful');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(response.error || 'Password reset failed');
            }
        } catch (error) {
            setError('Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8 }}>
                <Paper elevation={3} sx={{ padding: 4, background: 'rgba(26, 32, 39, 0.9)' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <LockOutlinedIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                            Reset Password
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="New Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                            {message && (
                                <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                                    {message}
                                </Alert>
                            )}
                            {error && (
                                <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                                    {error}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default ResetPassword;