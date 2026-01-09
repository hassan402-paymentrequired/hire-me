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
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignUlid('team_member_id')->nullable()->after('provider_id')
                ->constrained('team_members')->nullOnDelete();
            $table->index('team_member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['team_member_id']);
            $table->dropIndex(['team_member_id']);
            $table->dropColumn('team_member_id');
        });
    }
};
