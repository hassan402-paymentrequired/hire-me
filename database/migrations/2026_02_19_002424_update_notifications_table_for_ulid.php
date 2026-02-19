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
        // Drop old columns
        Schema::table('notifications', function (Blueprint $table) {

            if (Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->dropColumn('notifiable_id');
            }

            if (Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->dropColumn('notifiable_type');
            }

        });

        // Create ULID morphs
        Schema::table('notifications', function (Blueprint $table) {

            $table->ulidMorphs('notifiable');

        });
    }

    /**
     * Reverse the migrations.
     */
     public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {

            $table->dropColumn(['notifiable_id', 'notifiable_type']);

            $table->morphs('notifiable');

        });
    }
};
