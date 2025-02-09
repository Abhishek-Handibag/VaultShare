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
    TextField,
    MenuItem
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk, uploadFile, downloadFile, listFiles, shareFile, createShareLink, deleteFile, revokeFileAccess, expireShareLink } from '../services/api';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import EncryptionIcon from '@mui/icons-material/Lock'; // Add this import
import SecurePDFViewer from './SecurePDFViewer';

function Dashboard() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [ownedFiles, setOwnedFiles] = useState([]);
    const [sharedFiles, setSharedFiles] = useState([]);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [downloadDialog, setDownloadDialog] = useState(false);
    const [shareDialog, setShareDialog] = useState(false);
    const [shareLinkDialog, setShareLinkDialog] = useState(false);
    const [previewDialog, setPreviewDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [password, setPassword] = useState('');
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePermission, setSharePermission] = useState('view');
    const [shareLink, setShareLink] = useState('');
    const [expiryHours, setExpiryHours] = useState(24);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);

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
            setOwnedFiles(data.owned_files || []);
            setSharedFiles(data.shared_files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
            setError('Failed to load files');
            setOwnedFiles([]);
            setSharedFiles([]);
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

    const handleFileAccess = async () => {
        try {
            const response = await downloadFile(selectedFileId, '');  // Empty password for owner
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const selectedFile = ownedFiles.find(f => f.id === selectedFileId);

                if (previewContent?.pending) {
                    // Handle preview
                    const contentType = response.headers.get('content-type') || selectedFile.content_type;
                    setPreviewContent({
                        url,
                        type: contentType,
                        name: selectedFile.file_name
                    });
                    setPreviewDialog(true);
                } else {
                    // Handle download
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = selectedFile.file_name;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
                setDownloadDialog(false);
                setPassword('');
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to access file');
            }
        } catch (error) {
            console.error('Error accessing file:', error);
            setError('Failed to access file');
        }
    };

    const handleDownload = async () => {
        try {
            // Skip password dialog for file owner
            const file = ownedFiles.find(f => f.id === selectedFileId);
            if (file?.is_owner) {
                await handleFileAccess();
                return;
            }

            const response = await downloadFile(selectedFileId, password);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.file_name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setDownloadDialog(false);
                setPassword('');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to download file');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            setError('Failed to download file');
        }
    };

    const handleShare = async () => {
        try {
            await shareFile(selectedFileId, shareEmail, sharePermission);
            setShareDialog(false);
            setShareEmail('');
            setSharePermission('view');
        } catch (error) {
            setError('Failed to share file');
        }
    };

    const handleCreateShareLink = async () => {
        try {
            const response = await createShareLink(selectedFileId, expiryHours);
            setShareLink(`${window.location.origin}${response.share_link}`);
        } catch (error) {
            setError('Failed to create share link');
        }
    };

    const handlePreview = async () => {
        try {
            const response = await downloadFile(selectedFileId, password);
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                // Find the file from either owned or shared files
                const selectedFile = ownedFiles.find(f => f.id === selectedFileId) ||
                    sharedFiles.find(f => f.id === selectedFileId);

                if (!selectedFile) {
                    throw new Error('File not found');
                }

                const contentType = response.headers.get('content-type') || selectedFile.content_type;
                setPreviewContent({
                    url,
                    type: contentType || 'application/octet-stream', // Fallback content type
                    name: selectedFile.file_name
                });
                setDownloadDialog(false);
                setPreviewDialog(true);
                setPassword('');
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to preview file');
            }
        } catch (error) {
            console.error('Error previewing file:', error);
            setError('Failed to preview file');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteFile(selectedFileId);
            setDeleteDialog(false);
            fetchFiles(); // Refresh the file list
            setSelectedFileId(null);
        } catch (error) {
            console.error('Error deleting file:', error);
            setError('Failed to delete file');
        }
    };

    const handleRevokeAccess = async (fileId, email) => {
        try {
            await revokeFileAccess(fileId, email);
            fetchFiles();
        } catch (error) {
            setError('Failed to revoke access');
        }
    };

    const handleExpireLink = async (token) => {
        try {
            await expireShareLink(token);
            // Refresh the file list to show updated link status
            fetchFiles();
        } catch (error) {
            setError('Failed to expire link');
            console.error('Error expiring link:', error);
        }
    };

    const handleFileAction = async (file, action) => {
        setSelectedFileId(file.id);
        if (!file.is_owner) { // Show password dialog for shared files
            setDownloadDialog(true);
            if (action === 'preview') {
                setPreviewContent({ pending: true });
            }
            return;
        }

        try {
            const response = await downloadFile(file.id, ''); // Empty password for owned files
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                if (action === 'preview') {
                    const contentType = response.headers.get('content-type') || file.content_type;
                    setPreviewContent({
                        url,
                        type: contentType || 'application/octet-stream',
                        name: file.file_name
                    });
                    setPreviewDialog(true);
                } else {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.file_name;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to access file');
            }
        } catch (error) {
            console.error('Error accessing file:', error);
            setError('Failed to access file');
        }
    };

    const renderPreview = () => {
        if (!previewContent?.type) {
            return (
                <Typography>
                    Unable to preview file. Content type not available.
                </Typography>
            );
        }

        if (previewContent.type.startsWith('image/')) {
            return (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '85vh'
                }}>
                    <img
                        src={previewContent.url}
                        alt={previewContent.name}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            );
        }

        if (previewContent.type === 'application/pdf') {
            // Get the current file being previewed
            const currentFile = [...ownedFiles, ...sharedFiles].find(f => f.id === selectedFileId);
            const hasDownloadPermission = currentFile?.is_owner || currentFile?.permission === 'download';

            return (
                <Box sx={{ height: '85vh' }}>
                    {hasDownloadPermission ? (
                        <iframe
                            src={previewContent.url}
                            width="100%"
                            height="100%"
                            title="PDF Viewer"
                            style={{ border: 'none' }}
                        />
                    ) : (
                        <SecurePDFViewer url={previewContent.url} />
                    )}
                </Box>
            );
        }

        if (previewContent.type.startsWith('text/')) {
            return (
                <iframe
                    src={previewContent.url}
                    width="100%"
                    height="70vh"
                    title="Text Viewer"
                />
            );
        }

        if (previewContent.type.startsWith('video/')) {
            return (
                <video
                    controls
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                >
                    <source src={previewContent.url} type={previewContent.type} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (previewContent.type.startsWith('audio/')) {
            return (
                <audio
                    controls
                    style={{ width: '100%' }}
                >
                    <source src={previewContent.url} type={previewContent.type} />
                    Your browser does not support the audio tag.
                </audio>
            );
        }

        return (
            <Typography>
                This file type cannot be previewed. Please download to view.
            </Typography>
        );
    };

    const EmptyStateBox = ({ icon, title, message }) => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                border: '2px solid #2f4f4f',
                borderRadius: 2,
                background: 'rgba(26, 32, 39, 0.95)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 0 15px rgba(0, 255, 0, 0.1)',
            }}
        >
            {icon}
            <Typography variant="h6" sx={{ mt: 2, color: '#00ff00', textAlign: 'center' }}>
                {title}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: '#7fff00', textAlign: 'center' }}>
                {message}
            </Typography>
        </Box>
    );

    // Update the renderUploadButton function
    const renderUploadButton = () => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 4,
                mb: 2,
                width: '100%',
                position: 'relative'
            }}
        >
            <Button
                variant="contained"
                // startIcon={<CloudUploadIcon />}
                onClick={() => setUploadDialog(true)}
                sx={{
                    minWidth: '200px',
                    padding: '12px 24px',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
                    border: '1px solid rgba(0, 255, 0, 0.1)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                        boxShadow: '0 0 30px rgba(0, 255, 0, 0.4)',
                        transform: 'scale(1.02)',
                        transition: 'all 0.3s ease'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon />
                    Secure Upload
                </Box>
            </Button>
            <Typography
                variant="body2"
                sx={{
                    mt: 1,
                    color: 'rgba(0, 255, 0, 0.7)',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}
            >
                End-to-end encrypted file sharing
            </Typography>
        </Box>
    );

    const renderUploadDialog = () => (
        <Dialog
            open={uploadDialog}
            onClose={() => {
                setUploadDialog(false);
                setSelectedFile(null);
                setPassword('');
            }}
            PaperProps={{
                sx: {
                    background: 'rgba(16, 20, 24, 0.95)',
                    border: '1px solid #2f4f4f',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.15)',
                    minWidth: '400px'
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid #2f4f4f',
                color: '#00ff00'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EncryptionIcon />
                    Secure File Upload
                </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{
                    border: '2px dashed #2f4f4f',
                    borderRadius: 2,
                    p: 3,
                    mb: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                        borderColor: '#00ff00',
                        boxShadow: '0 0 10px rgba(0, 255, 0, 0.1)'
                    }
                }}>
                    <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        id="file-input"
                    />
                    <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                        <CloudUploadIcon sx={{ fontSize: 40, color: '#00ff00', mb: 1 }} />
                        <Typography sx={{ color: '#00ff00' }}>
                            {selectedFile ? selectedFile.name : 'Click or drag to upload file'}
                        </Typography>
                    </label>
                </Box>
                <TextField
                    fullWidth
                    type="password"
                    label="Encryption Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#2f4f4f' },
                            '&:hover fieldset': { borderColor: '#00ff00' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff00' },
                        },
                        '& .MuiInputLabel-root': { color: '#00ff00' },
                        '& .MuiInputBase-input': { color: '#fff' }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    fullWidth
                    sx={{
                        mt: 2,
                        background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                        boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                            boxShadow: '0 0 15px rgba(0, 255, 0, 0.5)',
                        }
                    }}
                >
                    Encrypt & Upload
                </Button>
            </DialogContent>
        </Dialog>
    );

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

            {renderUploadButton()}

            <Container maxWidth="lg">
                {/* Remove the first Paper component with "Files" section */}
                {/* Keep the rest of the owned files and shared files sections */}
                {/* ...existing Container content... */}
            </Container>

            {renderUploadDialog()}

            {/* Download/Preview Dialog */}
            <Dialog open={downloadDialog} onClose={() => {
                setDownloadDialog(false);
                setError(null);
                setPassword('');
                setPreviewContent(null);
            }}>
                <DialogTitle>Enter Password to {previewContent?.pending ? 'Preview' : 'Download'}</DialogTitle>
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
                    <Button
                        variant="contained"
                        onClick={previewContent?.pending ? handlePreview : handleDownload}
                    >
                        {previewContent?.pending ? 'Preview' : 'Download'}
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialog} onClose={() => setShareDialog(false)}>
                <DialogTitle>Share File</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        select
                        fullWidth
                        label="Permission"
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value)}
                        margin="normal"
                    >
                        <MenuItem value="view">View Only</MenuItem>
                        <MenuItem value="download">Download</MenuItem>
                    </TextField>
                    <Button variant="contained" onClick={handleShare}>
                        Share
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Share Link Dialog */}
            <Dialog open={shareLinkDialog} onClose={() => setShareLinkDialog(false)}>
                <DialogTitle>Create Share Link</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        type="number"
                        label="Expiry Hours"
                        value={expiryHours}
                        onChange={(e) => setExpiryHours(e.target.value)}
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleCreateShareLink}>
                        Generate Link
                    </Button>
                    {shareLink && (
                        <TextField
                            fullWidth
                            value={shareLink}
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <IconButton onClick={() => navigator.clipboard.writeText(shareLink)}>
                                        <ContentCopyIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog
                open={previewDialog}
                onClose={() => {
                    setPreviewDialog(false);
                    setPreviewContent(null);
                }}
                maxWidth="xl" // Change from lg to xl
                fullWidth
                PaperProps={{
                    sx: {
                        height: '90vh',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{ p: 2 }}>
                    {previewContent?.name}
                </DialogTitle>
                <DialogContent sx={{ p: 1 }}>
                    {renderPreview()}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this file? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* Owned Files Section */}
                <Paper sx={{ p: 3, mb: 3, background: 'rgba(26, 32, 39, 0.9)' }}>
                    <Typography variant="h5" gutterBottom>Files You Own</Typography>
                    {ownedFiles.length === 0 ? (
                        <EmptyStateBox
                            icon={<SecurityIcon sx={{ fontSize: 60, color: '#00ff00' }} />}
                            title="No Files Found"
                            message="Your secure vault is empty. Upload encrypted files to get started."
                        />
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>File Name</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell>Shared With</TableCell>
                                        <TableCell>Share Links</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ownedFiles.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell>{file.file_name}</TableCell>
                                            <TableCell>{Math.round(file.file_size / 1024)} KB</TableCell>
                                            <TableCell>
                                                {file.shared_with?.map(share => (
                                                    <Box key={share.email} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="body2">
                                                            {share.email} ({share.permission})
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRevokeAccess(file.id, share.email)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                {file.share_links?.map(link => (
                                                    <Box key={link.token} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="body2">
                                                            Expires: {new Date(link.expires_at).toLocaleDateString()}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleExpireLink(link.token)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => {
                                                    setSelectedFileId(file.id);
                                                    setDownloadDialog(true);
                                                }}>
                                                    <DownloadIcon />
                                                </IconButton>
                                                <IconButton onClick={() => {
                                                    setSelectedFileId(file.id);
                                                    setDownloadDialog(true);
                                                    // Set a flag to indicate we want to preview
                                                    setPreviewContent({ pending: true });
                                                }}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton onClick={() => {
                                                    setSelectedFileId(file.id);
                                                    setShareDialog(true);
                                                }}>
                                                    <ShareIcon />
                                                </IconButton>
                                                <IconButton onClick={() => {
                                                    setSelectedFileId(file.id);
                                                    setShareLinkDialog(true);
                                                }}>
                                                    <LinkIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedFileId(file.id);
                                                        setDeleteDialog(true);
                                                    }}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* Shared With You Section */}
                <Paper sx={{ p: 3, background: 'rgba(26, 32, 39, 0.9)' }}>
                    <Typography variant="h5" gutterBottom>Shared With You</Typography>
                    {sharedFiles.length === 0 ? (
                        <EmptyStateBox
                            icon={<LockIcon sx={{ fontSize: 60, color: '#00ff00' }} />}
                            title="No Shared Files"
                            message="No files have been shared with you yet. Shared files will appear here."
                        />
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>File Name</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell>Owner</TableCell>
                                        <TableCell>Permission</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sharedFiles.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell>{file.file_name}</TableCell>
                                            <TableCell>{Math.round(file.file_size / 1024)} KB</TableCell>
                                            <TableCell>{file.owner}</TableCell>
                                            <TableCell>{file.permission}</TableCell>
                                            <TableCell>
                                                {file.permission === 'download' && (
                                                    <IconButton onClick={() => handleFileAction(file, 'download')}>
                                                        <DownloadIcon />
                                                    </IconButton>
                                                )}
                                                <IconButton onClick={() => handleFileAction(file, 'preview')}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container >
        </Box >
    );
}

export default Dashboard;