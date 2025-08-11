import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Card,
} from '@mui/material';
import { Search, ArrowLeft, Filter } from 'lucide-react';
import ScheduleCard from '../components/ScheduleCard';
import { scheduleService } from '../services';
import { ScheduleResponse } from '../types';

const AllSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadAllSchedules();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [schedules, searchTerm, statusFilter]);

  const loadAllSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await scheduleService.getAllSchedules();
      setSchedules(response.schedules || []);
      
    } catch (err) {
      console.error('Failed to load schedules:', err);
      setError('Failed to load schedules');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSchedules = () => {
    let filtered = schedules;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(schedule => 
        schedule.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }

    setFilteredSchedules(filtered);
  };

  const handleClockIn = (scheduleId: number) => {
    loadAllSchedules();
  };

  const handleClockOut = (scheduleId: number) => {
    loadAllSchedules();
  };

  const handleViewProgress = (scheduleId: number) => {
    navigate(`/schedule/${scheduleId}/tasks`);
  };

  const handleViewReport = (scheduleId: number) => {
    navigate(`/schedule/${scheduleId}/report`);
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          onClick={handleBackToDashboard}
          startIcon={<ArrowLeft size={20} />}
          sx={{ mr: 2, color: 'text.primary', textTransform: 'none' }}
        >
          All Schedules
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
          <TextField
            fullWidth
            placeholder="Search by client name, service, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
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
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#9ca3af',
                },
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {filteredSchedules.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredSchedules.length} of {schedules.length} schedules
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            variant="outlined" 
            onClick={loadAllSchedules}
            sx={{ ml: 2, textTransform: 'none' }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {filteredSchedules.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onClockIn={() => handleClockIn(schedule.id)}
              onClockOut={() => handleClockOut(schedule.id)}
              onViewProgress={() => handleViewProgress(schedule.id)}
              onViewReport={() => handleViewReport(schedule.id)}
            />
          ))}
        </Box>
      ) : !loading && (
        <Card sx={{ p: 6, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No schedules found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'There are no schedules available at the moment.'
            }
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default AllSchedules; 