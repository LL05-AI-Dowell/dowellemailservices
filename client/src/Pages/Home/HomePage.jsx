import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Snackbar,
    TextField,
    Card,
    CardContent,
    Menu,
    MenuItem,
    IconButton,
    Grid,
    Box,
    Container,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiAlert from '@mui/material/Alert';
import Cookies from 'js-cookie';  // Import js-cookie for managing cookies
import { useNavigate } from 'react-router-dom'; // For programmatic navigation
import { verifyEmailAddress, selfIdentification } from '../../services/api.services';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Alert = React.forwardRef((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    transition: '0.3s',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
    '&:hover': {
        boxShadow: '0 16px 70px -12.125px rgba(0,0,0,0.3)',
    },
}));

const ResultCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    margin: theme.spacing(2, 0),
    borderRadius: 16,
    background: 'linear-gradient(60deg, #fafafa 0%, #ffffff 100%)',
    boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .03)',
}));

const HomePage = () => {
    const [userData, setUserData] = useState(null);
    const [emailToVerify, setEmailToVerify] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [verificationResult, setVerificationResult] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isTimeLimitReached, setIsTimeLimitReached] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await selfIdentification();
                if (response.success) {
                    setUserData(response.data);
                } else {
                    showNotification('Failed to fetch user data.', 'error');
                }
            } catch (error) {
                showNotification('Failed to fetch user data.', 'error');
            }
        };

        fetchUserData();
    }, []);

    const handleVerifyEmail = async () => {
        try {
            const response = await verifyEmailAddress(emailToVerify);
            if (response && response.success) {
                if (response.statusCode === 404 && response.message === 'You have consumed the maximum allowed time.') {
                    setIsTimeLimitReached(true);
                    setOpenDialog(true);
                    showNotification('You have consumed the maximum allowed time.', 'error');
                } else {
                    showNotification('Email verification successful!', 'success');
                    setVerificationResult(response.data.isEmailValid);
                }
            } else {
                const errorMessage = response?.message || 'Email verification failed. Please try again.';
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            const errorMessage = error?.response?.message || 'An unexpected error occurred. Please try again later.';
            showNotification(errorMessage, 'error');
        }
    };

    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setEmailToVerify(email);
        setIsEmailValid(validateEmail(email));
    };

    const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity });
    };

    const handleClose = () => {
        setNotification({ ...notification, open: false });
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleLogout = () => {
        Cookies.remove('authToken'); // Remove the authentication cookie (or any other relevant cookies)
        navigate('/'); // Redirect to home page
    };

    return (
        <Box sx={{ flexGrow: 1, background: 'linear-gradient(45deg, #f3f4f6 30%, #e5e7eb 90%)', minHeight: '100vh' }}>
            <StyledAppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        DoWell Email Services
                    </Typography>
                    <IconButton color="inherit" onClick={handleMenuClick}>
                        <AccountCircleIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {userData && (
                            <Box padding={2}>
                                <Typography variant="h6">User Details</Typography>
                                <MenuItem disabled>Email: {userData.email}</MenuItem>
                                <MenuItem disabled>Total Used Time: {userData.totalUsedTime} hours</MenuItem>
                                <MenuItem disabled>Usage Count: {userData.usageDetails.usageCount}</MenuItem>
                                <MenuItem disabled>Maximum Allowed Time: {userData.maximumAllowedTime} hours</MenuItem>
                                <MenuItem disabled>Active User: {userData.isActiveUser ? 'Yes' : 'No'}</MenuItem>
                                <MenuItem disabled>
                                    Last Usage: {new Date(userData.lastUsageTimestamp).toLocaleString()}
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem> {/* Logout Button */}
                            </Box>
                        )}
                    </Menu>
                </Toolbar>
            </StyledAppBar>

            {/* Rest of the component remains unchanged */}
            
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Time Limit Reached</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography variant="body1">
                            You have consumed the maximum allowed time for email verifications.
                        </Typography>
                    </Box>
                    <Typography variant="body2">
                        Please check back later or contact support for more information about your usage limits.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HomePage;
