<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            // Drop old notifiable columns if they exist
            if (Schema::hasColumn('push_subscriptions', 'notifiable_id')) {
                $table->dropColumn('notifiable_id');
            }
            if (Schema::hasColumn('push_subscriptions', 'notifiable_type')) {
                $table->dropColumn('notifiable_type');
            }

            // Add ULID columns
            if (! Schema::hasColumn('push_subscriptions', 'subscribable_id')) {
                $table->string('subscribable_id', 50)->nullable()->after('content_encoding');
            }
            if (! Schema::hasColumn('push_subscriptions', 'subscribable_type')) {
                $table->string('subscribable_type', 50)->nullable()->after('subscribable_id');
            }
        });

        // Add unique index with prefix lengths to avoid MySQL key limit
        DB::statement('
    ALTER TABLE push_subscriptions 
    ADD UNIQUE push_subscriptions_unique (
        subscribable_type(50), 
        subscribable_id(50), 
        endpoint(191)
    )
');

    }

    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['subscribable_id', 'subscribable_type']);
            $table->nullableMorphs('notifiable');
        });
    }
};
