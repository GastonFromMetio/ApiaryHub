<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hive extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'apiary_id',
        'name',
        'apiary',
        'latitude',
        'longitude',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    // Relationships to other models
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function apiaryEntity(): BelongsTo
    {
        return $this->belongsTo(Apiary::class, 'apiary_id');
    }

    // A hive can have many readings over time.
    public function readings(): HasMany
    {
        return $this->hasMany(Reading::class);
    }

    // A hive can have many actions performed on it.
    public function actions(): HasMany
    {
        return $this->hasMany(Action::class);
    }
}
