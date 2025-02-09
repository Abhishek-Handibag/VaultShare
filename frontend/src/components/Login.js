import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Paper, CircularProgress, Alert, Skeleton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, verifyOtpThunk } from '../services/api';

function Login() {
  const dispatch = useDispatch();
  const { error, otpRequired, status } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  React.useEffect(() => {
    // Simulate initial page load
    setTimeout(() => setPageLoading(false), 1000);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      if (!showOtpField) {
        const result = await dispatch(loginThunk({
          email: formData.email,
          password: formData.password
        })).unwrap();

        if (result.message === 'OTP sent to email') {
          setShowOtpField(true);
          setErrors({ success: 'OTP sent successfully to your email!' });
        }
      } else {
        const result = await dispatch(verifyOtpThunk({
          email: formData.email,
          otp: formData.otp
        })).unwrap();

        if (result.success) {
          setErrors({ success: 'Login successful! Redirecting...' });
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Network error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ mt: 8 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(26, 32, 39, 0.9)',
            borderRadius: 2,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6,
            }
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {errors.success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {errors.success}
            </Alert>
          )}

          {errors.submit && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

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
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            {!showOtpField ? (
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                name="otp"
                label="Enter OTP"
                type="text"
                id="otp"
                value={formData.otp}
                onChange={handleChange}
                error={!!errors.otp}
                helperText={errors.otp}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                height: 48,
                position: 'relative'
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              ) : (
                showOtpField ? 'Verify OTP' : 'Sign In'
              )}
            </Button>
            {errors.submit && (
              <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {errors.submit}
              </Typography>
            )}
            <Typography variant="body2" align="center">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#2196f3' }}>
                Sign Up
              </Link>
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              <Link to="/forgot-password" style={{ color: '#2196f3' }}>
                Forgot Password?
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
