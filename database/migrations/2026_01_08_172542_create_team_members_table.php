<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['admin', 'staff'])->default('staff');
            $table->json('permissions')->nullable()->comment('Additional permissions as JSON');
            $table->boolean('is_active')->default(true);
            $table->foreignUlid('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->index('provider_id');
            $table->index('user_id');
            $table->index('is_active');
            $table->unique(['provider_id', 'user_id']); // One user can only be added once per provider
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
