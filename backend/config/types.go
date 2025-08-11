package config

import "time"

type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	Service  ServiceConfig  `yaml:"service"`
}

type ServerConfig struct {
	Host string `yaml:"host"`
	Port string `yaml:"port"`
	Env  string `yaml:"env"`
}

type DatabaseConfig struct {
	URL               string `yaml:"url"`
	MaxOpenConnection int    `yaml:"maxOpenConnection"`
	MaxIdleConnection int    `yaml:"maxIdleConnection"`
}

type ServiceConfig struct {
	MaxDistanceError        float64       `yaml:"maxDistanceError"`
	MaxDistanceWarning      float64       `yaml:"maxDistanceWarning"`
	MaxEarlyClockInSeconds  time.Duration `yaml:"maxEarlyClockInSeconds"`
	MaxLateClockInSeconds   time.Duration `yaml:"maxLateClockInSeconds"`
	MinVisitDurationSeconds time.Duration `yaml:"minVisitDurationSeconds"`
}
