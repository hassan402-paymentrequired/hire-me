<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('reference', 20)->nullable()->unique()->after('id');
            $table->decimal('home_service_fee', 12, 2)->default(0)->after('price');
            $table->foreignUlid('promo_code_id')->nullable()->after('discount_percent')->constrained('promo_codes')->nullOnDelete();
            $table->decimal('promo_discount_amount', 12, 2)->default(0)->after('promo_code_id');
            $table->timestamp('client_day_before_reminder_sent_at')->nullable();
            $table->timestamp('client_two_hour_reminder_sent_at')->nullable();
        });

        Schema::table('appointment_services', function (Blueprint $table) {
            $table->foreignUlid('team_member_id')->nullable()->after('service_id')->constrained('team_members')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointment_services', function (Blueprint $table) {
            $table->dropConstrainedForeignId('team_member_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('promo_code_id');
            $table->dropUnique(['reference']);
            $table->dropColumn([
                'reference',
                'home_service_fee',
                'promo_discount_amount',
                'client_day_before_reminder_sent_at',
                'client_two_hour_reminder_sent_at',
            ]);
        });
    }
};
