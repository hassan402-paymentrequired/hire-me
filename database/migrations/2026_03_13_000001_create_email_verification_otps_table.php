<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_verification_otps', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->unique()->constrained()->cascadeOnDelete();

            $table->string('code_hash');
            $table->timestamp('expires_at')->index();

            $table->unsignedSmallInteger('attempts')->default(0);
            $table->unsignedSmallInteger('sent_count')->default(0);
            $table->timestamp('last_sent_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_verification_otps');
    }
};

