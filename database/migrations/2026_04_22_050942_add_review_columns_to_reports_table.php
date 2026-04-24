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
        Schema::table('reports', function (Blueprint $table) {
            $table->enum('review_status', ['pending', 'approved', 'rejected'])->default('pending')->after('end_date');
            $table->text('review_remarks')->nullable()->after('review_status');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete()->after('review_remarks');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['review_status', 'review_remarks', 'reviewed_by', 'reviewed_at']);
        });
    }
};
