<?php

namespace App\Domains\Identity\Actions;

use App\Domains\Identity\Services\MessageCentralService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendOtpAction
{
    public function __construct(
        private MessageCentralService $messageCentral
    ) {}

    /**
     * Generate and cache an OTP for the given phone and role.
     *
     * @param array{phone: string, role: string} $data
     * @return void
     */
    public function execute(array $data): void
    {
        $phone = $data['phone'];
        $role = $data['role'];

        // Restrict Owner access to specific numbers
        if ($role === 'owner') {
            $allowedOwners = [
                '9087021592',
                '8264911447'
            ];
            
            $cleanPhone = preg_replace('/\D/', '', $phone);
            if (strlen($cleanPhone) > 10) {
                $cleanPhone = substr($cleanPhone, -10);
            }
            
            if (!in_array($cleanPhone, $allowedOwners)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'phone' => ['This phone number is not authorized as an Owner.'],
                ]);
            }
        }

        if ($this->messageCentral->isConfigured()) {
            try {
                // Send OTP via Message Central API
                $verificationId = $this->messageCentral->sendOtp($phone);
                if ($verificationId) {
                    // Cache the verification ID instead of the OTP code
                    Cache::put("verification_id_{$phone}", $verificationId, now()->addMinutes(5));
                    // Clear any leftover local mock OTP
                    Cache::forget("otp_{$phone}");
                    return;
                }
            } catch (\Exception $e) {
                Log::error("Failed to send OTP via Message Central: " . $e->getMessage());
                // Fall back to local mock to avoid locking out users in case of API issues
            }
        }

        // Fallback Mock Behavior (Local/Development or API failure)
        // Generate a random 6-digit OTP or default to '123456' for local environment
        $otp = app()->environment('production') ? (string) random_int(100000, 999999) : '123456';

        // Cache the local OTP for 5 minutes
        Cache::put("otp_{$phone}", $otp, now()->addMinutes(5));
        // Clear any leftover verification ID
        Cache::forget("verification_id_{$phone}");

        Log::info("Local Mock OTP generated for {$phone} (Role: {$role}): {$otp}");
    }
}
