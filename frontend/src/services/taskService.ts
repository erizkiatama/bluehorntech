import api from './api';
import { UpdateTaskRequest, APIResponse } from '../types';

export const taskService = {
  // Update task status
  updateTask: async (id: number, data: UpdateTaskRequest): Promise<APIResponse> => {
    const response = await api.patch<APIResponse>(`/api/v1/tasks/${id}`, data);
    return response.data;
  },
}; 