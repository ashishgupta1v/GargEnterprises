<?php

namespace App\Domains\Identity\Actions;

use App\Domains\Identity\Models\User;
use App\Domains\Identity\Services\DeviceBindingService;
use App\Domains\Identity\Services\MessageCentralService;
use App\Domains\Audit\Services\AuditLogService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class VerifyOtpAction
{
    private const MAX_OTP_ATTEMPTS = 5;
    private const LOCKOUT_SECONDS = 1800; // 30 minutes

    public function __construct(
        private DeviceBindingService $deviceService,
        private AuditLogService $auditService,
        private MessageCentralService $messageCentral,
    ) {}

    /**
     * Verify OTP and issue JWT.
     *
     * @param array{phone: string, otp: string, role: string, device_fingerprint: string} $data
     * @return array
     */
    public function execute(array $data): array
    {
        $phone = $data['phone'];
        $otp = $data['otp'];
        $role = $data['role'];
        $deviceFingerprint = $data['device_fingerprint'];

        // ── Step 1: Check lockout ──
        $this->checkLockout($phone);

        // ── Step 2: Verify OTP ──
        $verified = false;
        $verificationId = Cache::get("verification_id_{$phone}");

        if ($verificationId && $this->messageCentral->isConfigured()) {
            // Verify via Message Central API
            $verified = $this->messageCentral->verifyOtp($verificationId, $otp);
        } else {
            // Fallback: Verify via local mock OTP
            $cachedOtp = Cache::get("otp_{$phone}");
            if ($cachedOtp && $cachedOtp === $otp) {
                $verified = true;
            }
        }

        if (!$verified) {
            $this->handleFailedAttempt($phone);
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.'],
            ]);
        }

        // ── Step 3: Clear OTP/Verification ID and Reset fail counter ──
        Cache::forget("otp_{$phone}");
        Cache::forget("verification_id_{$phone}");
        Cache::forget("otp_attempts:{$phone}");

        // ── Step 4: Find or Create User ──
        if ($role === 'owner') {
            $allowedOwners = [
                '9087021592' => 'Ashish Gupta',
                '8264911447' => 'Pankaj Garg'
            ];
            
            $cleanPhone = preg_replace('/\D/', '', $phone);
            if (strlen($cleanPhone) > 10) {
                $cleanPhone = substr($cleanPhone, -10);
            }
            
            if (!array_key_exists($cleanPhone, $allowedOwners)) {
                throw ValidationException::withMessages([
                    'phone' => ['This phone number is not authorized as an Owner.'],
                ]);
            }
            
            $ownerName = $allowedOwners[$cleanPhone];
            
            $user = User::where('phone', $phone)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $ownerName,
                    'phone' => $phone,
                    'role' => 'owner',
                    'pin_hash' => bcrypt(random_int(100000, 999999)),
                    'status' => 'active',
                ]);
            } else {
                // Ensure name and role are correct/updated
                $user->update([
                    'name' => $ownerName,
                    'role' => 'owner',
                ]);
            }
        } else {
            $user = User::where('phone', $phone)->first();
            if (!$user) {
                $user = User::create([
                    'name' => ucfirst($role) . ' User',
                    'phone' => $phone,
                    'role' => $role,
                    'pin_hash' => bcrypt(random_int(100000, 999999)),
                    'status' => 'active',
                ]);
            }
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'phone' => ['Account is inactive.'],
            ]);
        }

        // ── Step 5: Validate device binding ──
        $this->deviceService->validateOrRegister($user, $deviceFingerprint);

        // ── Step 6: Generate tokens ──
        $tokenExpiry = $this->getTokenExpiry($user->role);
        $accessToken = $user->createToken(
            'mobile_access',
            ['*'],
            now()->addHours($tokenExpiry)
        );

        // ── Step 7: Audit log ──
        $this->auditService->log(
            userId: $user->id,
            action: 'auth.login_otp',
            entityType: 'user',
            entityId: $user->id,
            newValue: [
                'device' => $deviceFingerprint,
                'ip'     => request()->ip(),
            ]
        );

        return [
            'access_token' => $accessToken->plainTextToken,
            'token_type'   => 'Bearer',
            'expires_at'   => now()->addHours($tokenExpiry)->toISOString(),
            'user'         => [
                'id'     => $user->id,
                'name'   => $user->name,
                'phone'  => $user->phone,
                'role'   => $user->role,
                'status' => $user->status,
            ],
        ];
    }

    private function checkLockout(string $phone): void
    {
        $lockKey = "otp_lockout:{$phone}";

        if (Cache::has($lockKey)) {
            $remainingSeconds = Cache::get($lockKey) - time();
            throw new HttpException(423, "Account locked. Try again in {$remainingSeconds} seconds.");
        }
    }

    private function handleFailedAttempt(string $phone): void
    {
        $attemptsKey = "otp_attempts:{$phone}";
        $attempts = (int) Cache::get($attemptsKey, 0) + 1;
        Cache::put($attemptsKey, $attempts, self::LOCKOUT_SECONDS);

        if ($attempts >= self::MAX_OTP_ATTEMPTS) {
            Cache::put("otp_lockout:{$phone}", time() + self::LOCKOUT_SECONDS, self::LOCKOUT_SECONDS);
            Cache::forget($attemptsKey);
        }
    }

    private function getTokenExpiry(string $role): int
    {
        return $role === 'owner' ? 24 : 10;
    }
}
