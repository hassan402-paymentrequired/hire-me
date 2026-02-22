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
        Schema::table('team_members', function (Blueprint $table) {
            $table->string('invitation_link')->nullable()->after('accepted_at');
            $table->timestamp('invitation_expires_at')->nullable()->after('invitation_link');

            $table->index('invitation_link');
            $table->index('invitation_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('team_members', function (Blueprint $table) {
            $table->dropIndex(['invitation_link']);
            $table->dropIndex(['invitation_expires_at']);
            $table->dropColumn('invitation_link');
            $table->dropColumn('invitation_expires_at');
        });
    }
};
