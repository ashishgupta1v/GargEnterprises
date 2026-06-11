<?php

namespace App\Domains\Identity\Services;

use App\Domains\Identity\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * DeviceBindingService
 *
 * Manages the trusted device registry for each user.
 * Each user is allowed a maximum of 2 registered devices.
 * Device fingerprints are SHA-256 hashes of (Device ID + App Install UUID).
 *
 * New devices require either:
 * - An empty slot (user has < 2 devices registered)
 * - Owner approval to replace an existing device (future enhancement)
 */
class DeviceBindingService
{
    private const MAX_DEVICES = 2;

    /**
     * Validate that the device is trusted, or register it if there's room.
     *
     * @param User   $user
     * @param string $deviceFingerprint SHA-256 hash string
     *
     * @throws HttpException If max devices reached and this device is unknown
     */
    public function validateOrRegister(User $user, string $deviceFingerprint): void
    {
        $registeredDevices = $user->device_ids ?? [];

        // Already trusted
        if (in_array($deviceFingerprint, $registeredDevices, true)) {
            return;
        }

        // Has room for a new device
        if (count($registeredDevices) < self::MAX_DEVICES) {
            $registeredDevices[] = $deviceFingerprint;
            $user->update(['device_ids' => $registeredDevices]);
            return;
        }

        // Max devices reached — block login
        throw new HttpException(
            403,
            'Maximum registered devices reached. Contact the Owner to remove an existing device.'
        );
    }

    /**
     * Remove a device fingerprint from the user's trusted list.
     * Used by the Owner to force-remove a device.
     */
    public function removeDevice(User $user, string $deviceFingerprint): void
    {
        $registeredDevices = $user->device_ids ?? [];
        $registeredDevices = array_values(array_filter(
            $registeredDevices,
            fn(string $d) => $d !== $deviceFingerprint
        ));
        $user->update(['device_ids' => $registeredDevices]);
    }

    /**
     * Clear all trusted devices for a user. Used for force-logout.
     */
    public function clearAllDevices(User $user): void
    {
        $user->update(['device_ids' => []]);
        $user->tokens()->delete(); // Revoke all Sanctum tokens
    }
}
