import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Checkbox,
  TextField,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Save,
  Play,
} from 'lucide-react';
import { scheduleService, taskService } from '../services';
import { ScheduleResponse } from '../types';

interface TaskState {
  id: number;
  name: string;
  description?: string;
  status: 'pending' | 'completed' | 'not completed';
  reason?: string;
}

const ScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clockingIn, setClockingIn] = useState(false);
  const [clockInError, setClockInError] = useState<string | null>(null);
  const [clockInSuccess, setClockInSuccess] = useState(false);
  
  const [clockingOut, setClockingOut] = useState(false);
  const [clockOutError, setClockOutError] = useState<string | null>(null);
  const [clockOutSuccess, setClockOutSuccess] = useState(false);

  const [tasks, setTasks] = useState<TaskState[]>([]);
  const [savingTasks, setSavingTasks] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editDisabled, setEditDisabled] = useState(false);

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

  useEffect(() => {
    if (id) {
      loadScheduleDetails(parseInt(id));
    }
  }, [id]);

  const loadScheduleDetails = async (scheduleId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getScheduleDetails(scheduleId);
      setSchedule(data);
      
      if (data.tasks) {
        const taskData = data.tasks.map(task => ({
          id: task.id,
          name: task.name,
          description: task.description,
          status: task.status,
          reason: task.reason,
        }));
        setTasks(taskData);
      }
    } catch (err) {
      console.error('Schedule detail error:', err);
      setError('Failed to load schedule details');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = (taskId: number, newStatus: 'pending' | 'completed' | 'not completed') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        if (task.status === newStatus) {
          return { ...task, status: 'pending', reason: undefined };
        }
        return { 
          ...task, 
          status: newStatus, 
          reason: newStatus === 'not completed' ? (task.reason || '') : undefined 
        };
      }
      return task;
    }));
  };

  const handleTaskReasonChange = (taskId: number, reason: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, reason } : task
    ));
  };

  const handleSaveTasks = async () => {
    try {
      setSavingTasks(true);
      setSaveSuccess(false);
      
      const updatePromises = tasks.map(task => 
        taskService.updateTask(task.id, {
          status: task.status,
          reason: task.status === 'not completed' ? task.reason : undefined
        })
      );
      
      await Promise.all(updatePromises);
      
      setSaveSuccess(true);
      setEditDisabled(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to save tasks:', err);
      setError('Failed to save task updates. Please try again.');
    } finally {
      setSavingTasks(false);
    }
  };

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

      if(!schedule) {
        setClockInError('Schedule not found');
        return;
      }

      await scheduleService.clockIn(schedule.id, {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      setClockInSuccess(true);
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

      if(!schedule) {
        setClockOutError('Schedule not found');
        return;
      }

      await scheduleService.clockOut(schedule.id, {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      setClockOutSuccess(true);
      schedule.status = 'completed';
      navigate('/success');

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !schedule) {
    return (
      <Box sx={{ pb: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pt: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/')}
            sx={{ mr: 2, color: 'text.primary', minWidth: 'auto', p: 1 }}
          >
          </Button>
          <Typography variant="h6" component="h1" fontWeight="600" color="text.primary">
            Schedule Details
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Schedule not found'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => loadScheduleDetails(parseInt(id!))}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2, px: 2, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pt: 2 }}>
        <Button onClick={() => navigate('/')} sx={{ mr: 2, color: 'text.primary', minWidth: 'auto', p: 1 }}>
          <ArrowLeft size={20} />
        </Button>
        <Typography variant="h6" component="h1" fontWeight="600" color="text.primary">
          Schedule Details
        </Typography>
      </Box>

      {/* Status Indicator or Clock-In Time */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        {schedule.status === 'in progress' && schedule.clock_in_time ? (
          <Box sx={{ 
            display: 'inline-block',
            backgroundColor: '#f97316',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '0.875rem'
          }}>
            🕒 Started at: {formatTime(schedule.clock_in_time)}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'inline-block',
            backgroundColor: schedule.status === 'scheduled' ? '#6b7280' : 
                           schedule.status === 'completed' ? '#22c55e' : '#ef4444',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '0.875rem'
          }}>
            {schedule.status === 'scheduled' && '📅 Scheduled'}
            {schedule.status === 'completed' && '✅ Completed'}
            {schedule.status === 'cancelled' && '❌ Cancelled'}
          </Box>
        )}
      </Box>

      {/* Service Information Card */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #e5e7eb', textAlign: 'center' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" color="#065f46" fontWeight="600" gutterBottom>
            {schedule.service_name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 48, height: 48 }} src="/api/placeholder/48/48" />
            <Typography variant="h6" fontWeight="600" color="text.primary">
              {schedule.client_name}
            </Typography>
          </Box>
          
          {schedule.status !== 'in progress' && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5, 
              alignItems: 'center',
              mt: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Calendar size={18} color="#9ca3af" />
                <Box><Typography variant="body2" sx={{ color: '#6b7280', fontSize: '1rem', fontWeight: 500 }}>{schedule.shift_date}</Typography></Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Clock size={18} color='#111827' />
                <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600, fontSize: '1rem' }}>
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="600" color="text.primary">
          Tasks:
        </Typography>
        {schedule.tasks && schedule.tasks.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map((task, index) => (
              <Card key={task.id} sx={{ 
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 'none',
                border: '1px solid #e5e7eb'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#0f766e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Typography variant="caption" color="white" fontWeight="bold">{index + 1}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" component="h4" color="#065f46" gutterBottom fontWeight="600" sx={{ fontSize: '1.1rem', mb: 1 }}>
                        {task.name}
                      </Typography>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2, color: '#6b7280', fontSize: '0.95rem' }}>
                          {task.description}
                        </Typography>
                      )}
                      
                      {schedule.status === 'in progress' ? (
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={task.status === 'completed'}
                                  onChange={() => {
                                    handleTaskStatusChange(task.id, 'completed');
                                  }}
                                  disabled={editDisabled}
                                  sx={{ 
                                    color: '#0f766e',
                                    '&.Mui-checked': {
                                      color: '#0f766e',
                                    },
                                  }}
                                />
                              }
                              label="Completed"
                              sx={{ mr: 3 }}
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={task.status === 'not completed'}
                                  onChange={() => {
                                    handleTaskStatusChange(task.id, 'not completed');
                                  }}
                                  disabled={editDisabled}
                                  sx={{ 
                                    color: '#dc2626',
                                    '&.Mui-checked': {
                                      color: '#dc2626',
                                    },
                                  }}
                                />
                              }
                              label="Not Completed"
                            />
                          </Box>
                          
                          {task.status === 'not completed' && (
                            <TextField
                              fullWidth
                              label="Reason for incomplete task"
                              value={task.reason || ''}
                              onChange={(e) => handleTaskReasonChange(task.id, e.target.value)}
                              disabled={editDisabled}
                              multiline
                              rows={2}
                              placeholder="Please provide a reason why this task was not completed..."
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '& fieldset': {
                                    borderColor: '#d1d5db',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#9ca3af',
                                  },
                                },
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ 
                            display: 'inline-block',
                            backgroundColor: task.status === 'completed' ? '#22c55e' : 
                                           task.status === 'not completed' ? '#ef4444' : '#f59e0b',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {task.status === 'completed' && '✅ Completed'}
                            {task.status === 'not completed' && '❌ Not Completed'}
                            {task.status === 'pending' && '⏳ Pending'}
                          </Box>
                          {task.status === 'not completed' && task.reason && (
                            <Typography variant="body2" color="#dc2626" sx={{ mt: 1, fontSize: '0.875rem' }}>
                              Reason: {task.reason}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            {schedule.status === 'in progress' && tasks.length > 0 && !editDisabled && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                {saveSuccess && (
                  <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }}>
                    Tasks updated successfully! ✅
                  </Alert>
                )}
                <Button
                  variant="contained"
                  startIcon={savingTasks ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
                  onClick={handleSaveTasks}
                  disabled={savingTasks}
                  sx={{
                    backgroundColor: '#0f766e',
                    '&:hover': {
                      backgroundColor: '#0d5b5b',
                    },
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 3,
                    py: 1.5,
                    px: 4,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  {savingTasks ? 'Saving...' : 'Save Task Updates'}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No tasks assigned for this schedule.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {schedule.service_notes && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom fontWeight="600" color="text.primary">
            Service Notes:
          </Typography>
          <Card sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, color: '#6b7280' }}>
                {schedule.service_notes}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {schedule.status === 'scheduled' && (
        <Box sx={{ mt: 4 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={clockingIn ? <CircularProgress size={16} color="inherit" /> : <Play size={16} />}
            onClick={handleClockIn}
            disabled={clockingIn}
            sx={{
              backgroundColor: '#0f766e',
              '&:hover': {
                backgroundColor: '#0d5b5b',
              },
              color: 'white',
              fontWeight: 600,
              borderRadius: 3,
              py: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
            }}
          >
            {clockingIn ? 'Clocking In...' : 'Clock-In Now'}
          </Button>
        </Box>
      )}

      {schedule.status === 'in progress' && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 2,
              justifyContent: 'center'
            }}>
              <Box sx={{ 
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="caption" color="white" fontWeight="bold">⏳</Typography>
              </Box>
              <Typography variant="h6" component="h3" fontWeight="600" color="#f97316">Work in Progress</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              You're currently working on this schedule. Manage your tasks and clock out when finished.
            </Typography>
          </Box>

          {clockOutError && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
              {clockOutError}
            </Alert>
          )}
          {clockOutSuccess && (
            <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Successfully clocked out! 🎉
            </Alert>
          )}
          
          <Button
            fullWidth
            variant="contained"
            startIcon={clockingOut ? <CircularProgress size={16} color="inherit" /> : undefined}
            onClick={handleClockOut}
            disabled={clockingOut}
            sx={{
              backgroundColor: '#dc2626',
              '&:hover': {
                backgroundColor: '#b91c1c',
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
      )}

      {schedule.status === 'completed' && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            justifyContent: 'center'
          }}>
            <Box sx={{ 
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="caption" color="white" fontWeight="bold">✅</Typography>
            </Box>
            <Typography variant="h6" component="h3" fontWeight="600" color="#22c55e">Schedule Completed</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This schedule was completed on {formatTime(schedule.clock_out_time)}.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ScheduleDetail;
