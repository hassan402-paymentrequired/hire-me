<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->timestamp('resolved_at')->nullable()->after('description');
            $table->foreignUlid('resolved_by')->nullable()->after('resolved_at')->constrained('users')->nullOnDelete();
            $table->text('action_taken')->nullable()->after('resolved_by');
            $table->enum('penalty_applied', ['warning', 'suspend', 'ban'])->nullable()->after('action_taken');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['resolved_by']);
            $table->dropColumn(['resolved_at', 'resolved_by', 'action_taken', 'penalty_applied']);
        });
    }
};
