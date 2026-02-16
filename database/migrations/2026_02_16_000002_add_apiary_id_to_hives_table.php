<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        Schema::table('hives', function (Blueprint $table) use ($driver) {
            if ($driver === 'sqlite') {
                $table->unsignedBigInteger('apiary_id')->nullable()->after('user_id');
                $table->index('apiary_id');
                return;
            }

            $table->foreignId('apiary_id')
                ->nullable()
                ->after('user_id')
                ->constrained('apiaries')
                ->nullOnDelete();
        });

        // Backfill apiary_id from legacy "apiary" text values if present.
        if (! Schema::hasColumn('hives', 'apiary')) {
            return;
        }

        $legacyRows = DB::table('hives')
            ->select('id', 'user_id', 'apiary')
            ->whereNull('apiary_id')
            ->whereNotNull('apiary')
            ->where('apiary', '!=', '')
            ->orderBy('id')
            ->get();

        $apiaryIdsByKey = [];
        $now = now();

        foreach ($legacyRows as $row) {
            $key = "{$row->user_id}|{$row->apiary}";

            if (! isset($apiaryIdsByKey[$key])) {
                $existingId = DB::table('apiaries')
                    ->where('user_id', $row->user_id)
                    ->where('name', $row->apiary)
                    ->value('id');

                $apiaryIdsByKey[$key] = $existingId ?? DB::table('apiaries')->insertGetId([
                    'user_id' => $row->user_id,
                    'name' => $row->apiary,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            DB::table('hives')
                ->where('id', $row->id)
                ->update(['apiary_id' => $apiaryIdsByKey[$key]]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        Schema::table('hives', function (Blueprint $table) use ($driver) {
            if ($driver === 'sqlite') {
                $table->dropIndex(['apiary_id']);
                $table->dropColumn('apiary_id');
                return;
            }

            $table->dropConstrainedForeignId('apiary_id');
        });
    }
};
