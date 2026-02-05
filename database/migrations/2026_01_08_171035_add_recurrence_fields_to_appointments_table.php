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
            $table->enum('recurrence_pattern', ['weekly', 'bi_weekly', 'monthly'])->nullable()->after('notes');
            $table->foreignUlid('recurrence_parent_id')->nullable()->after('recurrence_pattern')
                ->constrained('appointments')->nullOnDelete();
            $table->date('recurrence_end_date')->nullable()->after('recurrence_parent_id');
            $table->integer('recurrence_count')->nullable()->after('recurrence_end_date')->comment('Total number of appointments in the series');
            $table->decimal('original_price', 10, 2)->nullable()->after('recurrence_count')->comment('Price before discount');
            $table->decimal('discount_percent', 5, 2)->nullable()->after('original_price')->default(0)->comment('Discount percentage for recurring bookings');
            
            $table->index('recurrence_parent_id');
            $table->index('recurrence_pattern');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['recurrence_parent_id']);
            $table->dropIndex(['recurrence_parent_id']);
            $table->dropIndex(['recurrence_pattern']);
            $table->dropColumn([
                'recurrence_pattern',
                'recurrence_parent_id',
                'recurrence_end_date',
                'recurrence_count',
                'original_price',
                'discount_percent',
            ]);
        });
    }
};
