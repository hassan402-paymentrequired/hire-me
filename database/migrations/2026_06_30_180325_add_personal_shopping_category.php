<?php

use App\Models\Category;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Category::updateOrCreate(
            ['slug' => Str::slug('Personal Shopping')],
            ['name' => 'Personal Shopping']
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Category::where('slug', Str::slug('Personal Shopping'))->delete();
    }
};
