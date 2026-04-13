<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('service_address_source')->nullable()->after('notes');
            $table->string('service_address_label')->nullable()->after('service_address_source');
            $table->text('service_address')->nullable()->after('service_address_label');
            $table->string('service_address_city')->nullable()->after('service_address');
            $table->string('service_address_state')->nullable()->after('service_address_city');
            $table->decimal('service_address_latitude', 10, 7)->nullable()->after('service_address_state');
            $table->decimal('service_address_longitude', 10, 7)->nullable()->after('service_address_latitude');

            $table->index('service_address_source');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['service_address_source']);
            $table->dropColumn([
                'service_address_source',
                'service_address_label',
                'service_address',
                'service_address_city',
                'service_address_state',
                'service_address_latitude',
                'service_address_longitude',
            ]);
        });
    }
};
