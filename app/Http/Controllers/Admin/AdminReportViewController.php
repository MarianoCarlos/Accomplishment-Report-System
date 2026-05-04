<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportViewController extends Controller
{
    public function index(): Response
    {
        $offices = Office::orderBy('name')
            ->with([
                'supervisor:id,name',
                'alternateSupervisor:id,name',
                'members' => fn ($query) => $query
                    ->whereJsonContains('roles', 'Employee')
                    ->orderBy('name')
                    ->with([
                        'position:id,name',
                        'reports' => fn ($reportQuery) => $reportQuery
                            ->select(['id', 'user_id', 'start_date', 'end_date', 'review_status', 'review_remarks', 'reviewed_at'])
                            ->whereNotNull('review_status')
                            ->where('review_status', '!=', 'draft')
                            ->orderByDesc('start_date')
                            ->with([
                                'entries' => fn ($entryQuery) => $entryQuery
                                    ->select(['id', 'report_id', 'entry_date', 'content'])
                                    ->orderByDesc('entry_date'),
                            ]),
                    ]),
            ])
            ->get(['id', 'name', 'supervisor_id', 'alternate_supervisor_id']);

        return Inertia::render('admin/office-report', [
            'offices' => $offices->map(fn (Office $office) => [
                'id'                  => $office->id,
                'name'                => $office->name,
                'supervisor'          => $office->supervisor ? ['id' => $office->supervisor->id, 'name' => $office->supervisor->name] : null,
                'alternateSupervisor' => $office->alternateSupervisor ? ['id' => $office->alternateSupervisor->id, 'name' => $office->alternateSupervisor->name] : null,
                'members'             => $office->members->map(function ($member) {
                    $reports = $member->reports
                        ->map(fn ($report) => [
                            'id'        => $report->id,
                            'startDate' => $report->start_date?->toDateString(),
                            'endDate'   => $report->end_date?->toDateString(),
                            'reviewStatus' => $report->review_status ?? 'draft',
                            'reviewRemarks' => $report->review_remarks,
                            'reviewedAt' => $report->reviewed_at?->toIso8601String(),
                            'entries'   => $report->entries
                                ->map(fn ($entry) => [
                                    'id'      => $entry->id,
                                    'date'    => $entry->entry_date?->toDateString(),
                                    'content' => $entry->content,
                                ])
                                ->sortByDesc('date')
                                ->values(),
                        ])
                        ->values();

                    return [
                        'id'       => $member->id,
                        'name'     => $member->name,
                        'email'    => $member->email,
                        'position' => $member->position?->name ?? 'Unassigned',
                        'reports'  => $reports,
                    ];
                })->values(),
            ])->values(),
        ]);
    }

    public function review(Request $request, Report $report)
    {
        $validated = $request->validate([
            'review_status' => 'required|in:approved,rejected',
            'review_remarks' => 'nullable|string|max:1000',
        ]);

        // Guard: only submitted/resubmitted/approved/rejected reports can be reviewed
        abort_unless(
            in_array($report->review_status, ['submitted', 'resubmitted', 'approved', 'rejected']),
            422,
            'This report is not available for review.'
        );

        $report->update([
            'review_status' => $validated['review_status'],
            'review_remarks' => $validated['review_remarks'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Report review submitted successfully.');
    }
}
