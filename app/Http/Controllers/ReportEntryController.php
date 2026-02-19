<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateReportEntryRequest;
use App\Models\ReportEntry;

class ReportEntryController extends Controller
{
    public function update(UpdateReportEntryRequest $request, ReportEntry $entry)
    {
        $entry->update([
            'content' => $request->content,
        ]);

        return back();
    }
}
