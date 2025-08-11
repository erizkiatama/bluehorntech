package helpers

import (
	"fmt"
	"math"
	"time"
)

// TODO: Implement this properly using map API later
func GetLocationDetail(lat, long float64) string {
	return fmt.Sprintf("Location details: %.2f - %.2f", lat, long)
}

func FormatShiftTime(start, end time.Time) string {
	return start.Format("15:04") + " - " + end.Format("15:04")
}

func FormatShiftDate(start time.Time) string {
	return start.Format("Mon, 02 Jan 2006")
}

// CalculateDistance calculates the distance between two points using Haversine formula
func CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers

	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLng/2)*math.Sin(dLng/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	distance := R * c

	return distance * 1000
}

// FormatDuration formats duration in human-readable format
func FormatDuration(duration time.Duration) string {
	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60

	if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}
