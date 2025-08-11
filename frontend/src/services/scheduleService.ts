import api from './api';
import { 
  ScheduleResponse, 
  ListScheduleResponse, 
  ClockInRequest, 
  ClockOutRequest,
  APIResponse 
} from '../types';

export const scheduleService = {
  // Get today's schedules
  getTodaySchedules: async (): Promise<ListScheduleResponse> => {
    const response = await api.get<APIResponse<ListScheduleResponse>>('/api/v1/schedules/today');
    return response.data.data || { schedules: [], stats: {missed: 0, upcoming: 0, completed: 0}};
  },

  // Get all schedules
  getAllSchedules: async (): Promise<ListScheduleResponse> => {
    const response = await api.get<APIResponse<ListScheduleResponse>>('/api/v1/schedules');
    return response.data.data || { schedules: [] };
  },

  // Get schedule details by ID
  getScheduleDetails: async (id: number): Promise<ScheduleResponse> => {
    const response = await api.get<APIResponse<ScheduleResponse>>(`/api/v1/schedules/${id}`);
    return response.data.data!;
  },

  // Clock in for a schedule
  clockIn: async (id: number, data: ClockInRequest): Promise<APIResponse> => {
    const response = await api.post<APIResponse>(`/api/v1/schedules/${id}/start`, data);
    return response.data;
  },

  // Clock out for a schedule
  clockOut: async (id: number, data: ClockOutRequest): Promise<APIResponse> => {
    const response = await api.post<APIResponse>(`/api/v1/schedules/${id}/end`, data);
    return response.data;
  },
}; 