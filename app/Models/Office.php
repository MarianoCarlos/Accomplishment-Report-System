<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Office extends Model
{
    protected $fillable = [
        'name',
        'supervisor_id',
        'alternate_supervisor_id',
    ];

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function alternateSupervisor()
    {
        return $this->belongsTo(User::class, 'alternate_supervisor_id');
    }

    public function members()
    {
        return $this->hasMany(User::class);
    }
}
