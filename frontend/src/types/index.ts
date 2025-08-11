// Schedule Types
export interface Schedule {
  id: number;
  user_id: number;
  client_name: string;
  service_name: string;
  service_notes?: string;
  location: string;
  status: ScheduleStatus;
  latitude: number;
  longitude: number;
  start_time: string;
  end_time: string;
  clock_in_time?: string;
  clock_out_time?: string;
  clock_in_latitude?: number;
  clock_in_longitude?: number;
  clock_out_latitude?: number;
  clock_out_longitude?: number;
  compliance_flags?: string[];
  validation_notes?: string;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export type ScheduleStatus = 'scheduled' | 'in progress' | 'completed' | 'cancelled';

// Task Types
export interface Task {
  id: number;
  schedule_id: number;
  name: string;
  description?: string;
  status: TaskStatus;
  reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'pending' | 'completed' | 'not completed';

// Response Types
export interface ListScheduleResponse {
  stats?: StatsResponse;
  schedules: ScheduleResponse[];
}

export interface StatsResponse {
  missed: number;
  upcoming: number;
  completed: number;
}

export interface ScheduleResponse {
  id: number;
  client_name: string;
  service_name: string;
  location: string;
  shift_time: string;
  shift_date: string;
  status: ScheduleStatus;
  service_notes?: string;
  clock_in_time?: string;
  clock_out_time?: string;
  clock_in_location?: string;
  clock_out_location?: string;
  tasks?: TaskResponse[];
  latitude?: number;
  longitude?: number;
}

export interface TaskResponse {
  id: number;
  schedule_id: number;
  name: string;
  description?: string;
  status: TaskStatus;
  reason?: string;
  completed_at?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: APIError;
}

export interface APIError {
  message: string;
  detail?: string;
}

// Form Types
export interface ClockInRequest {
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export interface ClockOutRequest {
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export interface UpdateTaskRequest {
  status: TaskStatus;
  reason?: string;
}

// UI State Types
export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface AppState {
  schedules: Schedule[];
  currentSchedule?: Schedule;
  loading: boolean;
  error?: string;
  location: LocationState | null;
} 