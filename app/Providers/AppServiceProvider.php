<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth-login', function (Request $request) {
            $email = $this->normalizedEmailKey($request);

            return [
                $this->authLimit(10, 'auth-login-ip|'.$request->ip()),
                $this->authLimit(5, 'auth-login-account|'.$email.'|'.$request->ip()),
            ];
        });

        RateLimiter::for('auth-register', function (Request $request) {
            return [
                $this->authLimit(3, 'auth-register|'.$request->ip()),
            ];
        });

        RateLimiter::for('auth-password-reset-request', function (Request $request) {
            $email = $this->normalizedEmailKey($request);

            return [
                $this->authLimit(5, 'auth-password-reset-request-ip|'.$request->ip()),
                $this->authLimit(3, 'auth-password-reset-request-account|'.$email.'|'.$request->ip()),
            ];
        });

        RateLimiter::for('auth-password-reset', function (Request $request) {
            $email = $this->normalizedEmailKey($request);

            return [
                $this->authLimit(5, 'auth-password-reset-ip|'.$request->ip()),
                $this->authLimit(5, 'auth-password-reset-account|'.$email.'|'.$request->ip()),
            ];
        });

        RateLimiter::for('auth-verification-resend', function (Request $request) {
            $email = $this->normalizedEmailKey($request);

            return [
                $this->authLimit(5, 'auth-verification-resend-ip|'.$request->ip()),
                $this->authLimit(3, 'auth-verification-resend-account|'.$email.'|'.$request->ip()),
            ];
        });
    }

    private function authLimit(int $attemptsPerMinute, string $key): Limit
    {
        return Limit::perMinute($attemptsPerMinute)
            ->by($key)
            ->response(function (Request $request, array $headers) {
                return response()->json([
                    'message' => 'Too many authentication attempts. Please retry in a minute.',
                ], 429, $headers);
            });
    }

    private function normalizedEmailKey(Request $request): string
    {
        $email = Str::lower(trim((string) $request->input('email', '')));

        return $email !== '' ? $email : 'guest';
    }
}
