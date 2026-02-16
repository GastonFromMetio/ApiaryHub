<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reading extends Model
{
    use HasFactory;

    protected $fillable = [
        'hive_id',
        'weight_kg',
        'temperature_c',
        'humidity_percent',
        'activity_index',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'weight_kg' => 'float',
            'temperature_c' => 'float',
            'humidity_percent' => 'float',
            'activity_index' => 'integer',
            'recorded_at' => 'datetime',
        ];
    }

    public function hive(): BelongsTo
    {
        return $this->belongsTo(Hive::class);
    }
}
