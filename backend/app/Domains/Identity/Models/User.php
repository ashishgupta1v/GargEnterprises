<?php

namespace App\Domains\Identity\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User Model
 *
 * Represents all system users across 4 roles: owner, manager, staff, godown.
 * Phone number is the unique login identifier. PIN stored as bcrypt hash.
 * Device IDs stored as JSONB array for trusted device binding (max 2).
 *
 * @property int    $id
 * @property string $name
 * @property string $phone
 * @property string $pin_hash
 * @property string $role          owner|manager|staff|godown
 * @property array  $device_ids    SHA-256 fingerprints (max 2)
 * @property string $status        active|inactive
 * @property string $created_at
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'users';

    public $timestamps = false; // Only created_at, managed manually

    protected $fillable = [
        'name',
        'phone',
        'pin_hash',
        'role',
        'device_ids',
        'status',
    ];

    protected $hidden = [
        'pin_hash',
    ];

    protected $casts = [
        'device_ids' => 'array',
    ];

    // ── Role Check Helpers ──

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isGodown(): bool
    {
        return $this->role === 'godown';
    }

    /**
     * Check if the user can perform maker actions (direct approval).
     * Only the Owner bypasses the maker-checker workflow.
     */
    public function canDirectApprove(): bool
    {
        return $this->isOwner();
    }

    /**
     * Check if the user has any of the given roles.
     */
    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    // ── Relationships ──

    public function stockMovementsSubmitted()
    {
        return $this->hasMany(\App\Domains\Inventory\Models\StockMovement::class, 'submitted_by');
    }

    public function stockMovementsApproved()
    {
        return $this->hasMany(\App\Domains\Inventory\Models\StockMovement::class, 'approved_by');
    }

    public function notifications()
    {
        return $this->hasMany(\App\Domains\Notification\Models\Notification::class, 'user_id');
    }
}
