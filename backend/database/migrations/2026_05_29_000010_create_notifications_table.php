<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Notifications table: In-app notification records.
     * Push dispatch via FCM happens asynchronously on creation.
     * Each notification has a type, title, body, and JSONB payload for deep linking.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->string('type', 50);                            // e.g. movement_pending, alert_low_stock
            $table->string('title', 255);
            $table->text('body')->nullable();
            $table->jsonb('payload')->nullable();                   // Deep link params (screen, entity_id, etc.)
            $table->timestampTz('read_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            // Unread notifications index (user + read status)
            $table->index(['user_id', 'read_at']);
            // Chronological listing
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
