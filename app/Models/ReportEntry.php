<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'entry_date',
        'content',
    ];

    protected $casts = [
        'entry_date' => 'date',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
