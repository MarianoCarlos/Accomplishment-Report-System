<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('report_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('report_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('entry_date');
            $table->longText('content')->nullable();

            $table->timestamps();

            $table->unique(['report_id', 'entry_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_entries');
    }
};
