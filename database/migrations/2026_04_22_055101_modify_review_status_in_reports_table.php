<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Expand the enum to include draft, submitted, resubmitted
        DB::statement("ALTER TABLE reports MODIFY COLUMN review_status ENUM('draft','submitted','resubmitted','pending','approved','rejected') NOT NULL DEFAULT 'draft'");

        // Convert existing 'pending' rows to 'draft'
        DB::table('reports')->where('review_status', 'pending')->update(['review_status' => 'draft']);
    }

    public function down(): void
    {
        // Convert back non-standard statuses to 'pending'
        DB::table('reports')->whereIn('review_status', ['draft', 'submitted', 'resubmitted'])->update(['review_status' => 'pending']);

        DB::statement("ALTER TABLE reports MODIFY COLUMN review_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
    }
};
