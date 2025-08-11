CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    service_notes TEXT,
    location VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',

    -- expected data
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,

    -- actual data
    clock_in_time TIMESTAMP WITH TIME ZONE,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    clock_in_latitude DECIMAL(10,8),
    clock_in_longitude DECIMAL(11,8),
    clock_out_latitude DECIMAL(10,8),
    clock_out_longitude DECIMAL(11,8),

    -- compliance and validation notes
    compliance_flags TEXT[],
    validation_notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('scheduled', 'in progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_shift_start ON schedules(clock_in_time);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_client_name ON schedules(client_name);
