package config

import (
	"errors"
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

var config *Config

// Load config from files or env variables
func Load() error {
	// Try to read config file (for development)
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		var configFileNotFoundError viper.ConfigFileNotFoundError
		if !errors.As(err, &configFileNotFoundError) {
			return fmt.Errorf("error reading config file: %w", err)
		}
	}

	// Overrides config for production via env variables
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	return viper.Unmarshal(&config)
}

// Get config
func Get() *Config {
	if config == nil {
		config = &Config{}
	}
	return config
}
