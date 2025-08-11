import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import ScheduleCard from '../components/ScheduleCard';
import { scheduleService } from '../services';
import { ScheduleResponse, StatsResponse } from '../types';

const Dashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const todaySchedules = await scheduleService.getTodaySchedules();

      setSchedules(todaySchedules.schedules || []);
      
      if (todaySchedules && todaySchedules.stats) {
        setStats(todaySchedules.stats);
      }
      
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = (scheduleId: number) => {
    loadDashboardData();
  };

  const handleClockOut = (scheduleId: number) => {
    loadDashboardData();
  };

  const handleViewProgress = (scheduleId: number) => {
    navigate(`/schedule/${scheduleId}`);
  };

  const handleViewReport = (scheduleId: number) => {
    navigate(`/schedule/${scheduleId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
          Welcome Louis!
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={loadDashboardData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      {/* Welcome Section */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          fontSize: '2rem',
          color: 'text.primary'
        }}
      >
        Welcome Louis!
      </Typography>
      
      {/* Stats Section - Keep using Material-UI for this */}
      {stats && (
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 6, 
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <Card sx={{ 
            flex: 1, 
            minWidth: 100, 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="div" 
                color="warning.main" 
                fontWeight="bold"
                sx={{ mb: 1 }}
              >
                {stats.upcoming || 0}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}
              >
                Upcoming Today's Schedule
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1, 
            minWidth: 100, 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="div" 
                color="error.main" 
                fontWeight="bold"
                sx={{ mb: 1 }}
              >
                {stats.missed || 0}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}
              >
                Missed Scheduled
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            flex: 1, 
            minWidth: 100, 
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="div" 
                color="success.main" 
                fontWeight="bold"
                sx={{ mb: 1 }}
              >
                {stats.completed || 0}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}
              >
                Today's Completed Schedule
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Schedule Section Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary">
          Schedule
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            color="primary.main" 
            sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => navigate('/all-schedules')}
          >
            See All
          </Typography>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 1
            }}
          >
            <Typography variant="caption" color="white" fontWeight="bold" fontSize="0.75rem">
              {schedules.length}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Schedule List - NOW USING ScheduleCard COMPONENT */}
      {schedules.length === 0 ? (
        <Card sx={{ 
          backgroundColor: 'white',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No schedules for today
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up! Check back later for new assignments.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onClockIn={() => handleClockIn(schedule.id)}
              onClockOut={() => handleClockOut(schedule.id)}
              onViewProgress={() => handleViewProgress(schedule.id)}
              onViewReport={() => handleViewReport(schedule.id)}
            />
          ))}
        </div>
      )}
    </Box>
  );
};

export default Dashboard;
