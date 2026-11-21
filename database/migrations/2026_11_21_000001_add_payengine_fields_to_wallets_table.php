<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->string('payengine_customer_id')->nullable()->unique();
            $table->string('payengine_wallet_id')->nullable()->unique();
            $table->string('payengine_account_number')->nullable()->unique();
            $table->string('payengine_status')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropUnique(['payengine_customer_id']);
            $table->dropUnique(['payengine_wallet_id']);
            $table->dropUnique(['payengine_account_number']);
            $table->dropColumn([
                'payengine_customer_id',
                'payengine_wallet_id',
                'payengine_account_number',
                'payengine_status',
            ]);
        });
    }
};
