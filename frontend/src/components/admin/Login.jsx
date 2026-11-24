import React, { useState , useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, TextField, Button } from '@mui/material'; // Ensure to import Material-UI components
import image from '../../assets/StartX.png';
import api, { getErrorMessage } from '../../api';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/login', { username, password });
            Cookies.set('admin', 'admin');
            navigate('/admin');
        } catch (error) {
            alert('Login failed: ' + getErrorMessage(error));
        }
    };
    // Already logged in? Go straight to the dashboard.
    useEffect(() => {
      if (Cookies.get('admin')) {
        navigate('/admin');
      }
    }, [navigate]);
    return (
        <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            {/* Left side - Login Form */}
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: '400px', flex: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Login
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    {/* Username Field */}
                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 2 }}>
                        Login
                    </Button>
                </Box>
            </Paper>

            {/* Right side - Image */}
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, maxWidth: '50%', paddingLeft: 3 }}>
                <img 
                    src={image} // Ensure 'image' is defined and available in the component
                    alt="Auth Visual" 
                    style={{ width: '100%', borderRadius: '10px', objectFit: 'cover' }}
                />
            </Box>
        </Container>
    );
};

export default AdminLogin;
