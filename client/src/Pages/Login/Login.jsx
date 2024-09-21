import React, { useState } from 'react';
import { TextField, Button, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { loginUser } from '../../services/api.services';
import Cookies from 'js-cookie';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(email);
            console.log('hereis response',response);
            
            if (response.success) {
                Cookies.set('accessToken', response.data.accessToken, { expires: 7, sameSite: 'None', secure: true });
                Cookies.set('refreshToken', response.data.refreshToken, { expires: 30, sameSite: 'None', secure: true });
                window.location.href = '/home';
            } else {
                showNotification('Login failed! Please try again.', 'error');
            }
        } catch (error) {
            showNotification('Login failed! Please try again.', 'error');
        }
    };

    const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity });
    };

    const handleClose = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-indigo-500">
            <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
                <div className="flex justify-center mb-6">
                    <img src="https://dowellfileuploader.uxlivinglab.online/hr/logo-2-min-min.png" alt="DoWell Email Services" className="h-16 mb-4" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-center text-gray-800">DoWell Email Services</h2>
                <p className="mb-6 text-center text-gray-600">Login to manage your email services</p>
                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mb-4"
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4 transition-shadow duration-200 rounded-lg shadow-lg hover:shadow-xl">
                        Login
                    </Button>
                </form>
                <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity={notification.severity}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
};

export default LoginPage;
