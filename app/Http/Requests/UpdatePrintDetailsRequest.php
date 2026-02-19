<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePrintDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'office'   => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'reviewer' => ['required', 'string', 'max:255'],
            'approver' => ['required', 'string', 'max:255'],
        ];
    }
}
