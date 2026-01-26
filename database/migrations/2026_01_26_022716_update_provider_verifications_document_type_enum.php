<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the enum to include new document types
        // MySQL doesn't support direct enum modification, so we use raw SQL
        DB::statement("ALTER TABLE provider_verifications MODIFY COLUMN document_type ENUM(
            'voters_card',
            'utility_bill',
            'bank_statement',
            'drivers_license',
            'national_id',
            'passport',
            'cac_registration',
            'tax_certificate',
            'business_license'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::statement("ALTER TABLE provider_verifications MODIFY COLUMN document_type ENUM(
            'passport',
            'national_id',
            'drivers_license'
        ) NOT NULL");
    }
};
