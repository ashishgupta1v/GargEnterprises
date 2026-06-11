<?php

namespace App\Domains\Identity\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MessageCentralService
{
    private string $customerId;
    private string $authToken;
    private string $baseUrl;

    public function __construct()
    {
        $this->customerId = config('services_domain.message_central.customer_id', '');
        $this->authToken = config('services_domain.message_central.auth_token', '');
        $this->baseUrl = rtrim(config('services_domain.message_central.base_url', 'https://cpaas.messagecentral.com/'), '/') . '/';
    }

    /**
     * Check if the Message Central service is fully configured with valid credentials.
     * Prevents runtime crashes when using placeholder or truncated screenshot tokens.
     */
    public function isConfigured(): bool
    {
        return !empty($this->customerId) 
            && !empty($this->authToken) 
            && !str_contains($this->authToken, 'placeholder') 
            && !str_ends_with($this->authToken, '..');
    }

    /**
     * Send an OTP to a mobile number via Message Central VerifyNow API.
     *
     * @param string $phone 10-digit mobile number
     * @return string|null The verification ID returned by the API, or null on failure/mock mode
     * @throws \Exception
     */
    public function sendOtp(string $phone): ?string
    {
        if (!$this->isConfigured()) {
            Log::info("Message Central is not configured or has truncated credentials. Skipping API call for phone: {$phone}.");
            return null;
        }

        try {
            // Clean phone number: remove non-digits
            $cleanPhone = preg_replace('/\D/', '', $phone);

            Log::info("Attempting to send OTP via Message Central to: +91{$cleanPhone}");

            $client = Http::withHeaders([
                'authToken' => $this->authToken,
                'accept' => 'application/json',
            ]);

            if (app()->environment('local')) {
                $client = $client->withoutVerifying();
            }

            $response = $client->post($this->baseUrl . 'verification/v3/send?' . http_build_query([
                'customerId' => $this->customerId,
                'countryCode' => '91',
                'flowType' => 'SMS',
                'mobileNumber' => $cleanPhone,
                'otpLength' => 6,
            ]));

            if ($response->failed()) {
                Log::error("Message Central Send OTP API failed: " . $response->body());
                throw new \Exception("Message Central API returned status: " . $response->status());
            }

            $data = $response->json();
            $verificationId = $data['data']['verificationId'] ?? $data['verificationId'] ?? null;

            if (!$verificationId) {
                Log::error("Failed to parse verificationId from Message Central response: " . json_encode($data));
                throw new \Exception("Invalid Message Central API response structure.");
            }

            Log::info("Message Central OTP sent successfully. Verification ID: {$verificationId}");
            return (string) $verificationId;

        } catch (\Exception $e) {
            Log::error("Message Central sendOtp exception: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify an OTP code against Message Central validate API.
     *
     * @param string $verificationId
     * @param string $code
     * @return bool
     */
    public function verifyOtp(string $verificationId, string $code): bool
    {
        if (!$this->isConfigured()) {
            Log::info("Message Central not configured. Skipping verification API call.");
            return false;
        }

        try {
            Log::info("Validating OTP code with Message Central. ID: {$verificationId}");

            $client = Http::withHeaders([
                'authToken' => $this->authToken,
                'accept' => 'application/json',
            ]);

            if (app()->environment('local')) {
                $client = $client->withoutVerifying();
            }

            $response = $client->get($this->baseUrl . 'verification/v3/validateOtp', [
                'verificationId' => $verificationId,
                'code' => $code,
                'customerId' => $this->customerId,
            ]);

            if ($response->failed()) {
                Log::warning("Message Central Validate OTP API failed: " . $response->body());
                return false;
            }

            $data = $response->json();
            $responseCode = $data['responseCode'] ?? $data['status'] ?? null;
            $verifyStatus = $data['data']['verificationStatus'] ?? '';
            $dataResponseCode = $data['data']['responseCode'] ?? null;

            // Check for success status (200), VERIFIED string, or VERIFICATION_COMPLETED string
            $isSuccess = ($responseCode == 200 || $responseCode === '200')
                || ($dataResponseCode == 200 || $dataResponseCode === '200')
                || strtoupper($verifyStatus) === 'VERIFIED'
                || strtoupper($verifyStatus) === 'VERIFICATION_COMPLETED';

            if ($isSuccess) {
                Log::info("Message Central validation succeeded for ID: {$verificationId}");
                return true;
            }

            Log::warning("Message Central validation failed: " . json_encode($data));
            return false;

        } catch (\Exception $e) {
            Log::error("Message Central verifyOtp exception: " . $e->getMessage());
            return false;
        }
    }
}
