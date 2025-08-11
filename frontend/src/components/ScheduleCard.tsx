import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Avatar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreHorizontal,
  MapPin,
  Calendar,
  Eye,
  Play,
  ClockIcon,
  Square,
} from 'lucide-react';
import { ScheduleResponse } from '../types';
import { scheduleService } from '../services';
import { useNavigate } from 'react-router-dom';

interface ScheduleCardProps {
  schedule: ScheduleResponse;
  onViewProgress?: () => void;
  onClockOut?: () => void;
  onClockIn?: () => void;
  onViewReport?: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ 
  schedule, 
  onViewProgress,
  onClockOut,
  onClockIn,
  onViewReport 
}) => {
  const navigate = useNavigate();
  const [clockingIn, setClockingIn] = useState(false);
  const [clockInError, setClockInError] = useState<string | null>(null);
  const [clockInSuccess, setClockInSuccess] = useState(false);
  
  const [clockingOut, setClockingOut] = useState(false);
  const [clockOutError, setClockOutError] = useState<string | null>(null);
  const [clockOutSuccess, setClockOutSuccess] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    handleMenuClose();
    navigate(`/schedule/${schedule.id}`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in progress':
        return {
          label: 'In progress',
          color: '#f97316', // orange
          backgroundColor: '#f97316',
        };
      case 'completed':
        return {
          label: 'Completed',
          color: '#22c55e', // green
          backgroundColor: '#22c55e',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: '#ef4444', // red
          backgroundColor: '#ef4444',
        };
      case 'scheduled':
      default:
        return {
          label: 'Scheduled',
          color: '#6b7280', // gray
          backgroundColor: '#6b7280',
        };
    }
  };

  const statusConfig = getStatusConfig(schedule.status);

  const parseTimeRange = () => {
    const formatTime = (date: Date | string | undefined) => {
      if (!date) return '';
      
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (error) {
        return date.toString();
      }
    };
    
    return { 
      start: formatTime(schedule.start_time), 
      end: formatTime(schedule.end_time) 
    };
  };

  const { start: startTime, end: endTime } = parseTimeRange();

  const handleClockIn = async () => {
    try {
      setClockingIn(true);
      setClockInError(null);
      setClockInSuccess(false);

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        });
      });

      const { latitude, longitude } = position.coords;

      await scheduleService.clockIn(schedule.id, {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      setClockInSuccess(true);
      
      if (onClockIn) {
        onClockIn();
      }

      schedule.status = 'in progress';

    } catch (error) {
      console.error('Clock-in error:', error);
      
      if (error && typeof error === 'object' && 'code' in error) {
        const geolocationError = error as any;
        switch (geolocationError.code) {
          case 1:
            setClockInError(
              'Location access denied. Please refresh the page and allow location access when prompted, or check your browser settings.'
            );
            break;
          case 2:
            setClockInError(
              'Location information unavailable. Please check if you have a stable internet connection and try again.'
            );
            break;
          case 3:
            setClockInError(
              'Location request timed out. Please try again in a moment.'
            );
            break;
          default:
            const {message} = geolocationError.response.data.error
            setClockInError(message);
        }
      }
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setClockingOut(true);
      setClockOutError(null);
      setClockOutSuccess(false);

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        });
      });

      const { latitude, longitude } = position.coords;

      await scheduleService.clockOut(schedule.id, {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      setClockOutSuccess(true);
      
      if (onClockOut) {
        onClockOut();
      }

      schedule.status = 'completed';

    } catch (error) {
      console.error('Clock-out error:', error);
      
      if (error && typeof error === 'object' && 'code' in error) {
        const geolocationError = error as any;
        switch (geolocationError.code) {
          case 1:
            setClockOutError(
              'Location access denied. Please refresh the page and allow location access when prompted, or check your browser settings.'
            );
            break;
          case 2:
            setClockOutError(
              'Location information unavailable. Please check if you have a stable internet connection and try again.'
            );
            break;
          case 3:
            setClockOutError(
              'Location request timed out. Please try again in a moment.'
            );
            break;
          default:
            if (geolocationError.response?.data?.error?.message) {
              setClockOutError(geolocationError.response.data.error.message);
            } else {
              setClockOutError('Failed to clock out. Please try again.');
            }
        }
      } else if (error instanceof Error) {
        setClockOutError(error.message);
      } else {
        setClockOutError('Failed to clock out. Please try again.');
      }
    } finally {
      setClockingOut(false);
    }
  };

  const renderActionButtons = () => {
    switch (schedule.status) {
      case 'scheduled':
        return (
          <Box>
            {clockInError && (
              <Alert 
                severity="error" 
                sx={{ mb: 2, fontSize: '0.875rem' }}
                action={
                  clockInError.includes('denied') && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        setClockInError(null);
                        handleClockIn();
                      }}
                      sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                    >
                      Retry
                    </Button>
                  )
                }
              >
                {clockInError}
              </Alert>
            )}
            {clockInSuccess && (
              <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }}>
                Successfully clocked in! 🎉
              </Alert>
            )}
            <Button
              fullWidth
              variant="contained"
              startIcon={clockingIn ? <CircularProgress size={16} color="inherit" /> : <Play size={16} />}
              onClick={handleClockIn}
              disabled={clockingIn}
              sx={{
                backgroundColor: '#0f766e', // teal-600
                '&:hover': {
                  backgroundColor: '#0d5b5b', // teal-700
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af', // gray-400
                },
                color: 'white',
                fontWeight: 600,
                borderRadius: 3,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem',
                mt: 3,
              }}
            >
              {clockingIn ? 'Clocking In...' : 'Clock-In Now'}
            </Button>
          </Box>
        );
      
      case 'in progress':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            {clockOutError && (
              <Alert 
                severity="error" 
                sx={{ fontSize: '0.875rem' }}
                action={
                  clockOutError.includes('denied') && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        setClockOutError(null);
                        handleClockOut();
                      }}
                      sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                    >
                      Retry
                    </Button>
                  )
                }
              >
                {clockOutError}
              </Alert>
            )}
            {clockOutSuccess && (
              <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                Successfully clocked out! 🎉
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<Eye size={16} />}
                onClick={() => navigate(`/schedule/${schedule.id}`)}
                sx={{
                  flex: 1,
                  borderColor: '#d1d5db', // gray-300
                  color: '#374151', // gray-700
                  fontWeight: 600,
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#f9fafb', // gray-50
                    borderColor: '#d1d5db',
                  },
                }}
              >
                View Progress
              </Button>
              <Button
                variant="contained"
                startIcon={clockingOut ? <CircularProgress size={16} color="inherit" /> : <Square size={16} />}
                onClick={handleClockOut}
                disabled={clockingOut}
                sx={{
                  flex: 1,
                  backgroundColor: '#dc2626', // red-600
                  '&:hover': {
                    backgroundColor: '#b91c1c', // red-700
                  },
                  '&:disabled': {
                    backgroundColor: '#9ca3af', // gray-400
                  },
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                }}
              >
                {clockingOut ? 'Clocking Out...' : 'Clock-Out Now'}
              </Button>
            </Box>
          </Box>
        );
      
      case 'completed':
        return (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Eye size={16} />}
            onClick={() => navigate(`/schedule/${schedule.id}`)}
            sx={{
              borderColor: '#d1d5db', // gray-300
              color: '#374151', // gray-700
              fontWeight: 600,
              borderRadius: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              mt: 3,
              '&:hover': {
                backgroundColor: '#f9fafb', // gray-50
                borderColor: '#d1d5db',
              },
            }}
          >
            View Report
          </Button>
        );
      
      case 'cancelled':
        return null;
      
      default:
        return null;
    }
  };

  return (
    <Card sx={{ 
      backgroundColor: 'white',
      borderRadius: 3,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      transition: 'box-shadow 0.2s ease-in-out',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Chip 
              label={statusConfig.label} 
              sx={{ 
                backgroundColor: statusConfig.backgroundColor,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
              }} 
            />
            <IconButton 
              size="small" 
              onClick={handleMenuClick}
              sx={{ 
                color: '#9ca3af',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                },
              }}
            >
              <MoreHorizontal size={20} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb' } }}
            >
              <MenuItem onClick={handleViewDetails} sx={{ py: 1.5, px: 2 }}>
                <Eye size={16} style={{ marginRight: 8 }} />
                View Details
              </MenuItem>
            </Menu>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 48, 
                height: 48,
                backgroundColor: '#0f766e',
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              {schedule.client_name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: '#065f46', mb: 0.5 }}>
                {schedule.service_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {schedule.client_name}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <MapPin size={18} color="#9ca3af" />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {schedule.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Calendar size={18} color="#9ca3af" />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {schedule.shift_date} • {startTime} - {endTime}
            </Typography>
          </Box>
          
          {renderActionButtons()}
        </CardContent>
      </Card>
  );
};

export default ScheduleCard;
