<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('topic')->nullable();
            $table->string('grade_level')->default('Kelas 10 SMA');
            $table->string('question_model')->default('Pilihan Ganda (HOTS)');
            $table->string('token', 16)->unique();
            $table->unsignedInteger('duration_minutes')->default(30);
            $table->string('status', 16)->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
