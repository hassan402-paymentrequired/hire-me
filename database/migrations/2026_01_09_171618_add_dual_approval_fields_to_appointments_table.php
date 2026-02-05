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
            $table->boolean('client_approved')->default(false)->after('status');
            $table->boolean('provider_approved')->default(false)->after('client_approved');
            $table->timestamp('client_approved_at')->nullable()->after('provider_approved');
            $table->timestamp('provider_approved_at')->nullable()->after('client_approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'client_approved',
                'provider_approved',
                'client_approved_at',
                'provider_approved_at',
            ]);
        });
    }
};
