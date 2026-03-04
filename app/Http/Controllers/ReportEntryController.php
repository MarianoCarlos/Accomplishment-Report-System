<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateReportEntryRequest;
use App\Models\ReportEntry;

class ReportEntryController extends Controller
{
    public function update(UpdateReportEntryRequest $request, ReportEntry $entry)
    {
        // Verify the entry belongs to the authenticated user's report
        abort_unless($entry->report->user_id === auth()->id(), 403);

        $entry->update([
            'content' => $request->content,
        ]);

        return back();
    }
}
