<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->decimal('escrow_amount', 10, 2)->nullable()->after('price');
            $table->string('escrow_status')->nullable()->after('escrow_amount')->comment('pending, held, released, refunded, forfeited');
            $table->foreignUlid('escrow_transaction_id')->nullable()->after('escrow_status')->constrained('wallet_transactions')->nullOnDelete();
            $table->timestamp('payment_released_at')->nullable()->after('escrow_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['escrow_transaction_id']);
            $table->dropColumn(['escrow_amount', 'escrow_status', 'escrow_transaction_id', 'payment_released_at']);
        });
    }
};
