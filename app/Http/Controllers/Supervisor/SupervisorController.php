<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Models\Office;
use Inertia\Inertia;
use Inertia\Response;

class SupervisorController extends Controller
{
    public function dashboard(): Response
    {
        $offices = $this->loadAssignedOffices();

        $employeeCount = $offices
            ->flatMap(fn (Office $office) => $office->members)
            ->unique('id')
            ->count();

        $reportCount = $offices
            ->flatMap(fn (Office $office) => $office->members)
            ->flatMap(fn ($member) => $member->reports)
            ->unique('id')
            ->count();

        $entryCount = $offices
            ->flatMap(fn (Office $office) => $office->members)
            ->flatMap(fn ($member) => $member->reports)
            ->flatMap(fn ($report) => $report->entries)
            ->count();

        return Inertia::render('supervisor/supervisor-dashboard', [
            'stats' => [
                'officeCount' => $offices->count(),
                'employeeCount' => $employeeCount,
                'reportCount' => $reportCount,
                'entryCount' => $entryCount,
            ],
            'assignedOffices' => $offices->map(fn (Office $office) => [
                'id' => $office->id,
                'name' => $office->name,
                'membersCount' => $office->members->count(),
            ])->values(),
        ]);
    }

    public function index(): Response
    {
        $offices = $this->loadAssignedOffices();

        return Inertia::render('supervisor/team', [
            'assignedOffices' => $offices->map(fn (Office $office) => [
                'id' => $office->id,
                'name' => $office->name,
                'members' => $office->members->map(function ($member) {
                    $reports = $member->reports
                        ->map(fn ($report) => [
                            'id' => $report->id,
                            'startDate' => $report->start_date?->toDateString(),
                            'endDate' => $report->end_date?->toDateString(),
                            'entries' => $report->entries
                                ->map(fn ($entry) => [
                                    'id' => $entry->id,
                                    'date' => $entry->entry_date?->toDateString(),
                                    'content' => $entry->content,
                                ])
                                ->sortByDesc('date')
                                ->values(),
                        ])
                        ->values();

                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'position' => $member->position?->name ?? 'Unassigned',
                        'reports' => $reports,
                    ];
                })->values(),
            ])->values(),
        ]);
    }

    private function loadAssignedOffices()
    {
        return Office::query()
            ->where('supervisor_id', auth()->id())
            ->with([
                'members' => fn ($query) => $query
                    ->where('role', 'Employee')
                    ->orderBy('name')
                    ->with([
                        'position:id,name',
                        'reports' => fn ($reportQuery) => $reportQuery
                            ->select(['id', 'user_id', 'start_date', 'end_date'])
                            ->orderByDesc('start_date')
                            ->with([
                                'entries' => fn ($entryQuery) => $entryQuery
                                    ->select(['id', 'report_id', 'entry_date', 'content'])
                                ->orderByDesc('entry_date'),
                            ]),
                    ]),
            ])
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
