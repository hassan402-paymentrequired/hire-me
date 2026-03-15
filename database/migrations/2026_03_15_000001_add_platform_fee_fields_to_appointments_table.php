<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->decimal('platform_fee_percent', 5, 2)->nullable()->after('payment_released_at');
            $table->decimal('platform_fee_amount', 10, 2)->nullable()->after('platform_fee_percent');
            $table->decimal('provider_payout_amount', 10, 2)->nullable()->after('platform_fee_amount');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'platform_fee_percent',
                'platform_fee_amount',
                'provider_payout_amount',
            ]);
        });
    }
};

