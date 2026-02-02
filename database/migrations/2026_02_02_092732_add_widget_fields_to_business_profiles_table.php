<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('business_profiles', function (Blueprint $table) {
            $table->boolean('widget_enabled')->default(false)->after('settings');
            $table->json('widget_settings')->nullable()->after('widget_enabled');
            $table->json('widget_domains')->nullable()->after('widget_settings');
        });
    }

    public function down(): void
    {
        Schema::table('business_profiles', function (Blueprint $table) {
            $table->dropColumn(['widget_enabled', 'widget_settings', 'widget_domains']);
        });
    }
};
