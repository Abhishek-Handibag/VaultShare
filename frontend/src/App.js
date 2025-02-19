import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import SharedFile from './components/SharedFile';
import { verifyAuthThunk } from './services/api';
import { Provider } from 'react-redux';
import { store } from './store/store';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#0a1929',
      paper: '#1a2027',
    },
  },
});

function AppRoutes() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { status } = useSelector(state => state.auth);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        await dispatch(verifyAuthThunk()).unwrap();
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuthentication();
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/login" element={
        status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={
        status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      <Route path="/forgot-password" element={
        status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
      } />
      <Route path="/reset-password" element={
        status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <ResetPassword />
      } />
      <Route path="/dashboard" element={
        status === 'authenticated' ? <Dashboard /> : <Navigate to="/login" replace />
      } />
      <Route path="/shared/:token" element={<SharedFile />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
