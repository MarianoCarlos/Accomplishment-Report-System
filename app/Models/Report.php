<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'office',
        'position',
        'reviewer',
        'approver',
        'is_archived',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_archived' => 'boolean',
    ];

    public function entries()
    {
        return $this->hasMany(ReportEntry::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
