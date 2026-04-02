<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('google_calendar_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('google_email')->nullable();
            $table->string('google_calendar_id')->default('primary');
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->boolean('sync_enabled')->default(true);
            $table->timestamp('last_synced_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_calendar_accounts');
    }
};
