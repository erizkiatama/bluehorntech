-- ============================================================================
-- SEED DATA: UPCOMING SCHEDULES WITH REALISTIC TIMING
-- ============================================================================

-- Clear existing data
DELETE FROM tasks;
DELETE FROM schedules;
DELETE FROM users;

-- Insert user (caregiver)
INSERT INTO users (id, name, phone, email) VALUES
    (1, 'John Doe', '+1-555-0123', 'john.doe@bluehorntech.com');

-- Generate upcoming schedules starting 5 minutes from now
-- Note: Using NOW() + INTERVAL to create dynamic timestamps

-- Schedule 1: 5 minutes from now (1 hour duration)
INSERT INTO schedules (
    id, user_id, client_name, service_name, service_notes,
    location, latitude, longitude,
    start_time, end_time, status,
    clock_in_time, clock_out_time,
    clock_in_latitude, clock_in_longitude,
    clock_out_latitude, clock_out_longitude,
    compliance_flags, validation_notes
) VALUES (
    1, 1, 'Emma Johnson', 'Personal Care',
    'Morning care routine including medication assistance and mobility support',
    'Sunrise Senior Living - Room 204', 40.7128, -74.0060,
    NOW() + INTERVAL '5 minutes', NOW() + INTERVAL '1 hour 5 minutes', 'scheduled',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- Schedule 2: 1 hour 5 minutes from now (45 minutes duration)
INSERT INTO schedules (
    id, user_id, client_name, service_name, service_notes,
    location, latitude, longitude,
    start_time, end_time, status,
    clock_in_time, clock_out_time,
    clock_in_latitude, clock_in_longitude,
    clock_out_latitude, clock_out_longitude,
    compliance_flags, validation_notes
) VALUES (
    2, 1, 'Robert Martinez', 'Medication Management',
    'Administer prescribed medications and monitor vital signs',
    'Golden Years Assisted Living - Unit 12B', 40.7145, -74.0058,
    NOW() + INTERVAL '1 hour 5 minutes', NOW() + INTERVAL '1 hour 50 minutes', 'scheduled',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- Schedule 3: 2 hours 5 minutes from now (1.5 hours duration)
INSERT INTO schedules (
    id, user_id, client_name, service_name, service_notes,
    location, latitude, longitude,
    start_time, end_time, status,
    clock_in_time, clock_out_time,
    clock_in_latitude, clock_in_longitude,
    clock_out_latitude, clock_out_longitude,
    compliance_flags, validation_notes
) VALUES (
    3, 1, 'Sarah Williams', 'Companionship & Light Housekeeping',
    'Social interaction, light meal preparation, and basic housekeeping tasks',
    'Peaceful Manor Care Home - Room 318', 40.7135, -74.0055,
    NOW() + INTERVAL '2 hours 5 minutes', NOW() + INTERVAL '3 hours 35 minutes', 'scheduled',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- Schedule 4: 3 hours 45 minutes from now (1 hour duration)
INSERT INTO schedules (
    id, user_id, client_name, service_name, service_notes,
    location, latitude, longitude,
    start_time, end_time, status,
    clock_in_time, clock_out_time,
    clock_in_latitude, clock_in_longitude,
    clock_out_latitude, clock_out_longitude,
    compliance_flags, validation_notes
) VALUES (
    4, 1, 'Michael Brown', 'Physical Therapy Assistance',
    'Assist with prescribed physical therapy exercises and mobility training',
    'Harmony Healthcare Center - Therapy Room A', 40.7150, -74.0065,
    NOW() + INTERVAL '3 hours 45 minutes', NOW() + INTERVAL '4 hours 45 minutes', 'scheduled',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- Schedule 5: 5 hours from now (2 hours duration)
INSERT INTO schedules (
    id, user_id, client_name, service_name, service_notes,
    location, latitude, longitude,
    start_time, end_time, status,
    clock_in_time, clock_out_time,
    clock_in_latitude, clock_in_longitude,
    clock_out_latitude, clock_out_longitude,
    compliance_flags, validation_notes
) VALUES (
    5, 1, 'Jennifer Davis', 'Comprehensive Care',
    'Full care service including bathing, dressing, medication, and meal assistance',
    'Comfort Care Residential - Suite 205', 40.7120, -74.0070,
    NOW() + INTERVAL '5 hours', NOW() + INTERVAL '7 hours', 'scheduled',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- Schedule 6: 7 hours 30 minutes from now (1.5 hours duration)
INSERT INTO schedules (
    id, user_id, client_name, service_name, service_notes,
    location, latitude, longitude,
    start_time, end_time, status,
    clock_in_time, clock_out_time,
    clock_in_latitude, clock_in_longitude,
    clock_out_latitude, clock_out_longitude,
    compliance_flags, validation_notes
) VALUES (
    6, 1, 'David Wilson', 'Evening Care Routine',
    'Evening medication, personal care, and bedtime preparation',
    'Serenity Senior Services - Room 142', 40.7140, -74.0050,
    NOW() + INTERVAL '7 hours 30 minutes', NOW() + INTERVAL '9 hours', 'scheduled',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- ============================================================================
-- TASKS FOR EACH SCHEDULE
-- ============================================================================

-- Tasks for Schedule 1 (Emma Johnson - Personal Care)
INSERT INTO tasks (id, schedule_id, name, description, status, reason, completed_at) VALUES
    (1, 1, 'Check Vital Signs', 'Measure blood pressure, temperature, and pulse', 'pending', '', NULL),
    (2, 1, 'Administer Morning Medication', 'Give prescribed morning medications with breakfast', 'pending', '', NULL),
    (3, 1, 'Assist with Personal Hygiene', 'Help with bathing and personal care routine', 'pending', '', NULL),
    (4, 1, 'Mobility Exercise', 'Assist with prescribed walking and movement exercises', 'pending', '', NULL);

-- Tasks for Schedule 2 (Robert Martinez - Medication Management)
INSERT INTO tasks (id, schedule_id, name, description, status, reason, completed_at) VALUES
    (5, 2, 'Review Medication List', 'Verify all prescribed medications are available', 'pending', '', NULL),
    (6, 2, 'Administer Medications', 'Give prescribed medications according to schedule', 'pending', '', NULL),
    (7, 2, 'Monitor for Side Effects', 'Observe and document any adverse reactions', 'pending', '', NULL),
(8, 2, 'Update Medication Log', 'Record all administered medications in client chart', 'pending', '', NULL);

-- Tasks for Schedule 3 (Sarah Williams - Companionship & Light Housekeeping)
INSERT INTO tasks (id, schedule_id, name, description, status, reason, completed_at) VALUES
    (9, 3, 'Social Interaction', 'Engage in conversation and recreational activities', 'pending', '', NULL),
    (10, 3, 'Prepare Light Meal', 'Prepare lunch according to dietary requirements', 'pending', '', NULL),
    (11, 3, 'Light Housekeeping', 'Tidy living areas and wash dishes', 'pending', '', NULL),
    (12, 3, 'Safety Check', 'Ensure home environment is safe and hazard-free', 'pending', '', NULL);

-- Tasks for Schedule 4 (Michael Brown - Physical Therapy Assistance)
INSERT INTO tasks (id, schedule_id, name, description, status, reason, completed_at) VALUES
    (13, 4, 'Range of Motion Exercises', 'Assist with prescribed stretching and flexibility exercises', 'pending', '', NULL),
    (14, 4, 'Walking Practice', 'Support client during walking therapy session', 'pending', '', NULL),
    (15, 4, 'Document Progress', 'Record therapy session outcomes and client response', 'pending', '', NULL);

-- Tasks for Schedule 5 (Jennifer Davis - Comprehensive Care)
INSERT INTO tasks (id, schedule_id, name, description, status, reason, completed_at) VALUES
    (16, 5, 'Personal Care Assistance', 'Complete bathing and dressing assistance', 'pending', '', NULL),
    (17, 5, 'Medication Administration', 'Give all scheduled medications for this time period', 'pending', '', NULL),
    (18, 5, 'Meal Preparation & Assistance', 'Prepare and assist with lunch meal', 'pending', '', NULL),
    (19, 5, 'Health Monitoring', 'Check and record vital signs and general health status', 'pending', '', NULL),
    (20, 5, 'Emotional Support', 'Provide companionship and emotional care', 'pending', '', NULL);

-- Tasks for Schedule 6 (David Wilson - Evening Care Routine)
INSERT INTO tasks (id, schedule_id, name, description, status, reason, completed_at) VALUES
    (21, 6, 'Evening Medication', 'Administer prescribed evening medications', 'pending', '', NULL),
    (22, 6, 'Personal Care', 'Assist with evening personal hygiene routine', 'pending', '', NULL),
    (23, 6, 'Prepare for Sleep', 'Help client prepare for bedtime including proper positioning', 'pending', '', NULL),
    (24, 6, 'Safety Check', 'Ensure room is safe and secure for overnight', 'pending', '', NULL);

-- ============================================================================
-- RESET SEQUENCE COUNTERS (PostgreSQL)
-- ============================================================================

-- Reset auto-increment sequences to continue from where we left off
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('schedules_id_seq', (SELECT MAX(id) FROM schedules));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
