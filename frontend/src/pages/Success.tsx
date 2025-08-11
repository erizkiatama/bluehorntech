import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import {
  X,
  CheckCircle,
} from 'lucide-react';

const Success: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        position: 'relative',
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          color: 'white',
        }}
      >
        <X size={24} />
      </IconButton>

      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: 'warning.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={32} color="#f59e0b" />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'white',
            opacity: 0.8,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -15,
            left: -15,
            width: 15,
            height: 15,
            borderRadius: '50%',
            backgroundColor: 'white',
            opacity: 0.6,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: -25,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'warning.main',
            opacity: 0.8,
          }}
        />
      </Box>

      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: 'white',
          fontWeight: 700,
          textAlign: 'center',
          mb: 3,
        }}
      >
        Success! 🎉
      </Typography>

      <Typography
        variant="h6"
        component="p"
        sx={{
          color: 'white',
          textAlign: 'center',
          mb: 4,
          opacity: 0.9,
          lineHeight: 1.5,
        }}
      >
        Your action has been completed successfully.
      </Typography>

      <Button
        variant="outlined"
        onClick={handleGoHome}
        sx={{
          borderColor: 'white',
          color: 'white',
          borderRadius: 3,
          py: 1.5,
          px: 4,
          fontWeight: 600,
          fontSize: '1rem',
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default Success; 