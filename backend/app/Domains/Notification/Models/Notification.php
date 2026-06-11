<?php

namespace App\Domains\Notification\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Notification Model
 *
 * In-app notification records. Push dispatch via FCM happens
 * asynchronously when a notification is created.
 *
 * @property int         $id
 * @property int         $user_id
 * @property string      $type       movement_pending, alert_low_stock, etc.
 * @property string      $title
 * @property string|null $body
 * @property array|null  $payload    Deep link params
 * @property string|null $read_at
 */
class Notification extends Model
{
    protected $table = 'notifications';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'payload',
        'read_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }
}
