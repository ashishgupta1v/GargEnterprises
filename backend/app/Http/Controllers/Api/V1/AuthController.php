<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Identity\Actions\SendOtpAction;
use App\Domains\Identity\Actions\VerifyOtpAction;
use App\Domains\Audit\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;

/**
 * AuthController
 *
 * Handles authentication endpoints: send-otp, verify-otp, refresh, and logout.
 * All responses follow the standard envelope:
 * {success: bool, data: {...}, timestamp: ISO8601}
 */
class AuthController extends Controller
{
    public function __construct(
        private SendOtpAction $sendOtpAction,
        private VerifyOtpAction $verifyOtpAction,
        private AuditLogService $auditService,
    ) {}

    /**
     * POST /v1/auth/send-otp
     */
    public function sendOtp(Request $request): JsonResponse
    {
        // Normalize role to lowercase to avoid casing mismatch errors
        if ($request->has('role')) {
            $request->merge(['role' => strtolower($request->input('role'))]);
        }

        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^[0-9]{10}$/',
            'role'  => 'required|string|in:owner,manager,staff,godown',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'VALIDATION_ERROR',
                    'message'     => $validator->errors()->first(),
                    'http_status' => 422,
                ],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        try {
            $this->sendOtpAction->execute($validator->validated());
            return response()->json([
                'success'   => true,
                'data'      => ['message' => 'OTP sent successfully.'],
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'VALIDATION_ERROR',
                    'message'     => $e->validator->errors()->first() ?: $e->getMessage(),
                    'http_status' => 422,
                ],
                'timestamp' => now()->toISOString(),
            ], 422);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("OTP send error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'OTP_SEND_FAILED',
                    'message'     => 'Failed to send OTP: ' . $e->getMessage(),
                    'http_status' => 500,
                ],
                'timestamp' => now()->toISOString(),
            ], 500);
        }
    }

    /**
     * POST /v1/auth/verify-otp
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        // Normalize role to lowercase to avoid casing mismatch errors
        if ($request->has('role')) {
            $request->merge(['role' => strtolower($request->input('role'))]);
        }

        $validator = Validator::make($request->all(), [
            'phone'              => 'required|string|regex:/^[0-9]{10}$/',
            'otp'                => 'required|string|digits:6',
            'role'               => 'required|string|in:owner,manager,staff,godown',
            'device_fingerprint' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'VALIDATION_ERROR',
                    'message'     => $validator->errors()->first(),
                    'http_status' => 422,
                ],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        try {
            $result = $this->verifyOtpAction->execute($validator->validated());

            return response()->json([
                'success'   => true,
                'data'      => $result,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'INVALID_CREDENTIALS',
                    'message'     => $e->getMessage(),
                    'http_status' => 401,
                ],
                'timestamp' => now()->toISOString(),
            ], 401);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'ACCOUNT_LOCKED',
                    'message'     => $e->getMessage(),
                    'http_status' => $e->getStatusCode(),
                ],
                'timestamp' => now()->toISOString(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("OTP verification error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'VERIFICATION_FAILED',
                    'message'     => 'Verification failed: ' . $e->getMessage(),
                    'http_status' => 500,
                ],
                'timestamp' => now()->toISOString(),
            ], 500);
        }
    }

    /**
     * POST /v1/auth/refresh
     *
     * Exchange a valid refresh token for a new access token.
     * The old token is revoked.
     */
    public function refresh(Request $request): JsonResponse
    {
        // Sanctum refresh: validate current token, issue new one
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'UNAUTHENTICATED',
                    'message'     => 'Invalid or expired token.',
                    'http_status' => 401,
                ],
                'timestamp' => now()->toISOString(),
            ], 401);
        }

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        // Issue new token
        $tokenExpiry = $user->role === 'owner' ? 24 : 10;
        $newToken = $user->createToken(
            'mobile_access',
            ['*'],
            now()->addHours($tokenExpiry)
        );

        return response()->json([
            'success' => true,
            'data'    => [
                'access_token' => $newToken->plainTextToken,
                'token_type'   => 'Bearer',
                'expires_at'   => now()->addHours($tokenExpiry)->toISOString(),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * POST /v1/auth/logout
     *
     * Revokes the current JWT. Device remains in the trusted list
     * (must be explicitly removed by Owner).
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Log before revoking
        $this->auditService->log(
            userId: $user->id,
            action: 'auth.logout',
            entityType: 'user',
            entityId: $user->id,
        );

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success'   => true,
            'data'      => ['message' => 'Logged out successfully.'],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * GET /v1/auth/me
     *
     * Returns the authenticated user's profile data.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success'   => true,
            'data'      => [
                'id'     => $user->id,
                'name'   => $user->name,
                'phone'  => $user->phone,
                'role'   => $user->role,
                'status' => $user->status,
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
