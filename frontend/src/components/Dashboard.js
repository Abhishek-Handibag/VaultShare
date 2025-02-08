import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    AppBar,
    Toolbar,
    IconButton,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk, uploadFile, downloadFile, listFiles } from '../services/api';

function Dashboard() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);  // Initialize with empty array
    const [uploadDialog, setUploadDialog] = useState(false);
    const [downloadDialog, setDownloadDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [password, setPassword] = useState('');
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await listFiles();
            setFiles(data.files || []); // Ensure files is always an array
        } catch (error) {
            console.error('Error fetching files:', error);
            setError('Failed to load files');
            setFiles([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logoutThunk());
    };

    const handleUpload = async () => {
        if (!selectedFile || !password) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('password', password);

        try {
            const response = await uploadFile(formData);
            if (response.message) {
                setUploadDialog(false);
                setSelectedFile(null);
                setPassword('');
                fetchFiles();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await downloadFile(selectedFileId, password);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = files.find(f => f.id === selectedFileId).file_name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setDownloadDialog(false);
                setPassword('');
            } else {
                // Handle error response
                const errorData = await response.json();
                setError(errorData.error || 'Failed to download file');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            setError('Failed to download file');
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        File Sharing Dashboard
                    </Typography>
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3, background: 'rgba(26, 32, 39, 0.9)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5">Files</Typography>
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => setUploadDialog(true)}
                        >
                            Upload File
                        </Button>
                    </Box>

                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : files.length === 0 ? (
                        <Typography>No files found</Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>File Name</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell>Upload Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {files.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell>{file.file_name}</TableCell>
                                            <TableCell>{Math.round(file.file_size / 1024)} KB</TableCell>
                                            <TableCell>{new Date(file.uploaded_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => {
                                                    setSelectedFileId(file.id);
                                                    setDownloadDialog(true);
                                                }}>
                                                    <DownloadIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>

            {/* Upload Dialog */}
            <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
                <DialogTitle>Upload File</DialogTitle>
                <DialogContent>
                    <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ marginBottom: 16 }}
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label="Encryption Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleUpload}>
                        Upload
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Download Dialog */}
            <Dialog open={downloadDialog} onClose={() => {
                setDownloadDialog(false);
                setError(null);
                setPassword('');
            }}>
                <DialogTitle>Enter Password to Download</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        type="password"
                        label="Decryption Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                    />
                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    <Button variant="contained" onClick={handleDownload}>
                        Download
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default Dashboard;