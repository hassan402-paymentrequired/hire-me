<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->decimal('balance', 10, 2)->default(0)->comment('Available balance');
            $table->decimal('escrow_balance', 10, 2)->default(0)->comment('Amount held in escrow');
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
