<?php

namespace App\Domains\Notification\Services;

use App\Domains\Notification\Models\Notification;
use App\Domains\Identity\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * FCMDispatcher
 *
 * Handles Firebase Cloud Messaging push notifications.
 * Sends notifications to user devices and stores in-app records.
 *
 * In Phase 1, FCM integration is stubbed out — notifications
 * are stored in the database but push delivery is not active.
 * Full FCM integration will be added in Phase 1.1.
 */
class FCMDispatcher
{
    /**
     * Send a push notification to a user and store an in-app record.
     *
     * @param User   $user    Target user
     * @param string $type    Notification type (e.g. 'movement_pending')
     * @param string $title   Push notification title
     * @param string $body    Push notification body
     * @param array  $payload Deep link params
     */
    public static function send(
        User $user,
        string $type,
        string $title,
        string $body,
        array $payload = [],
    ): void {
        // Store in-app notification
        Notification::create([
            'user_id' => $user->id,
            'type'    => $type,
            'title'   => $title,
            'body'    => $body,
            'payload' => $payload,
        ]);

        // TODO: Phase 1.1 — Send via FCM HTTP v1 API
        // $fcmServerKey = config('services.fcm.server_key');
        // $fcmProjectId = config('services.fcm.project_id');
        //
        // Http::withHeaders([
        //     'Authorization' => "key={$fcmServerKey}",
        // ])->post("https://fcm.googleapis.com/v1/projects/{$fcmProjectId}/messages:send", [
        //     'message' => [
        //         'topic'        => "user_{$user->id}",
        //         'notification' => ['title' => $title, 'body' => $body],
        //         'data'         => $payload,
        //     ],
        // ]);

        Log::info("FCM stub: Notification stored for user {$user->id}", [
            'type'  => $type,
            'title' => $title,
        ]);
    }

    /**
     * Alert the Owner about a new pending movement.
     */
    public static function alertOwnerPendingMovement(
        User $owner,
        string $productName,
        string $movementType,
        string $submitterName,
    ): void {
        self::send(
            $owner,
            'movement_pending',
            'New Approval Required',
            "{$submitterName} submitted a {$movementType} for {$productName}.",
            ['screen' => 'ApprovalQueue'],
        );
    }

    /**
     * Alert the Owner about account lockout.
     */
    public static function alertOwnerLockout(User $owner, User $lockedUser): void
    {
        self::send(
            $owner,
            'security_lockout',
            'Account Locked',
            "{$lockedUser->name} ({$lockedUser->phone}) has been locked after 5 failed PIN attempts.",
            ['screen' => 'UserManagement', 'user_id' => $lockedUser->id],
        );
    }

    /**
     * Send daily alert summary to the Owner.
     */
    public static function alertOwnerDailySummary(User $owner, array $alertCounts): void
    {
        $total = array_sum($alertCounts);
        $body = "Today's alerts: " .
            "{$alertCounts['out_of_stock']} out-of-stock, " .
            "{$alertCounts['low_stock']} low-stock, " .
            "{$alertCounts['dead_stock']} dead-stock, " .
            "{$alertCounts['excess_stock']} excess-stock.";

        self::send(
            $owner,
            'daily_alert_summary',
            "Daily Inventory Report: {$total} alerts",
            $body,
            ['screen' => 'Dashboard'],
        );
    }
}
