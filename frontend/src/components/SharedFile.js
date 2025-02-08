
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress
} from '@mui/material';
import { getSharedFile } from '../services/api';

function SharedFile() {
    const { token } = useParams();
    const [fileData, setFileData] = useState(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileContent, setFileContent] = useState(null);

    const fetchFileData = async (withPassword = false) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getSharedFile(token, withPassword ? password : '');

            if (response.file_name) {
                setFileData(response);
                return;
            }

            // Handle file content
            const contentType = response.headers.get('content-type');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            setFileContent({
                url,
                type: contentType
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFileData();
    }, [token]);

    const handlePasswordSubmit = () => {
        if (!password) return;
        fetchFileData(true);
    };

    const renderFileContent = () => {
        if (!fileContent) return null;

        if (fileContent.type.startsWith('image/')) {
            return (
                <img
                    src={fileContent.url}
                    alt="Shared file"
                    style={{ maxWidth: '100%', maxHeight: '80vh' }}
                />
            );
        }

        if (fileContent.type === 'application/pdf') {
            return (
                <iframe
                    src={fileContent.url}
                    width="100%"
                    height="800px"
                    title="PDF Viewer"
                />
            );
        }

        // For other file types, show download button
        return (
            <Button
                variant="contained"
                href={fileContent.url}
                download
            >
                Download File
            </Button>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, background: 'rgba(26, 32, 39, 0.9)' }}>
                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : fileContent ? (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {fileData?.file_name}
                        </Typography>
                        {renderFileContent()}
                    </Box>
                ) : fileData ? (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {fileData.file_name}
                        </Typography>
                        <Typography gutterBottom>
                            Size: {Math.round(fileData.file_size / 1024)} KB
                        </Typography>
                        <Typography gutterBottom>
                            Shared by: {fileData.owner}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                type="password"
                                label="Enter password to view file"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                margin="normal"
                            />
                            <Button
                                variant="contained"
                                onClick={handlePasswordSubmit}
                                disabled={!password}
                            >
                                View File
                            </Button>
                        </Box>
                    </Box>
                ) : null}
            </Paper>
        </Container>
    );
}

export default SharedFile;