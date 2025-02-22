import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Box
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const dialogStyles = {
    paper: {
        background: 'rgba(16, 20, 24, 0.95)',
        border: '1px solid #2f4f4f',
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '& .MuiDialogTitle-root': {
            borderBottom: '1px solid #2f4f4f',
            color: '#00ff00'
        }
    }
};

const UserInfo = ({ open, onClose, user }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ sx: dialogStyles.paper }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid #2f4f4f',
                color: '#00ff00'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircleIcon />
                    User Information
                </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Email"
                            secondary={user?.email}
                            primaryTypographyProps={{ color: '#00ff00' }}
                            secondaryTypographyProps={{ color: '#7fff00' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Account Status"
                            secondary="Active"
                            primaryTypographyProps={{ color: '#00ff00' }}
                            secondaryTypographyProps={{ color: '#7fff00' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Join Date"
                            secondary={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            primaryTypographyProps={{ color: '#00ff00' }}
                            secondaryTypographyProps={{ color: '#7fff00' }}
                        />
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #2f4f4f', p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: '#00ff00',
                        borderColor: '#00ff00',
                        '&:hover': {
                            borderColor: '#7fff00',
                            backgroundColor: 'rgba(0, 255, 0, 0.1)'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserInfo;
