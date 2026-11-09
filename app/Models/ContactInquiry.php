<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactInquiry extends Model
{
    use SoftDeletes;

    protected $fillable = ['reference', 'name', 'email', 'phone', 'preferred_contact', 'subject', 'source', 'topic', 'message', 'admin_notes', 'status', 'read_at'];
    protected function casts(): array { return ['read_at' => 'datetime']; }
    public function getRouteKeyName(): string { return 'reference'; }
}
