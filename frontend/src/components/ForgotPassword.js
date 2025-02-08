
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { forgotPassword } from '../services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await forgotPassword({ email });
            setMessage(response.message);
            setError('');
        } catch (error) {
            setError('Failed to send reset link');
            setMessage('');
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
                            Forgot Password
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                            {message && (
                                <Typography color="primary" sx={{ mt: 2, textAlign: 'center' }}>
                                    {message}
                                </Typography>
                            )}
                            {error && (
                                <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                                    {error}
                                </Typography>
                            )}
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Link to="/" style={{ color: '#2196f3' }}>
                                    Back to Login
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default ForgotPassword;