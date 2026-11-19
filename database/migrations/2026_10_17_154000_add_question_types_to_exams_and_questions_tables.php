<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->unsignedSmallInteger('jumlah_soal')->default(10)->after('grade_level');
            $table->json('question_types')->nullable()->after('jumlah_soal');

            $table->dropColumn('question_model');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->string('type', 32)->default('Pilihan Ganda')->after('order');
            $table->json('correct_answers')->nullable()->after('correct_answer');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->string('question_model')->default('Pilihan Ganda');
            $table->dropColumn(['jumlah_soal', 'question_types']);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['type', 'correct_answers']);
        });
    }
};
