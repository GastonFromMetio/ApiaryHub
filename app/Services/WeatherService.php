<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WeatherService
{
    public function forCoordinates(float $latitude, float $longitude): array
    {
        $response = Http::acceptJson()
            ->timeout(10)
            ->get('https://api.open-meteo.com/v1/forecast', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'current' => 'temperature_2m,relative_humidity_2m,wind_speed_10m,rain',
                'daily' => 'temperature_2m_min,temperature_2m_max,precipitation_sum',
                'timezone' => 'auto',
                'forecast_days' => 2,
            ])
            ->throw();

        $payload = $response->json();

        return [
            'provider' => 'open-meteo',
            'coordinates' => [
                'latitude' => $payload['latitude'] ?? $latitude,
                'longitude' => $payload['longitude'] ?? $longitude,
            ],
            'current' => [
                'at' => $payload['current']['time'] ?? null,
                'temperature_c' => $payload['current']['temperature_2m'] ?? null,
                'humidity_percent' => $payload['current']['relative_humidity_2m'] ?? null,
                'wind_kmh' => $payload['current']['wind_speed_10m'] ?? null,
                'rain_mm' => $payload['current']['rain'] ?? null,
            ],
            'forecast_short' => [
                'day' => $payload['daily']['time'][0] ?? null,
                'temperature_min_c' => $payload['daily']['temperature_2m_min'][0] ?? null,
                'temperature_max_c' => $payload['daily']['temperature_2m_max'][0] ?? null,
                'precipitation_mm' => $payload['daily']['precipitation_sum'][0] ?? null,
            ],
        ];
    }
}
