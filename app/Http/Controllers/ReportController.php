<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdatePrintDetailsRequest;
use App\Models\Report;
use App\Models\Office;
use App\Models\Position;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::with('entries')
            ->where('user_id', auth()->id())
            ->get();

        $active = $reports->where('is_archived', false)->values();
        $archived = $reports->where('is_archived', true)->values();

        return Inertia::render('user/accomplishment-report', [
            'activeReports' => $this->transformReports($active),
            'archivedReports' => $this->transformReports($archived),
            'offices' => Office::orderBy('name')->get(),
            'positions' => Position::orderBy('name')->get(),
            'users' => User::orderBy('name')->get(),
        ]);
    }

    public function store(StoreReportRequest $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $exists = Report::where('user_id', auth()->id())
            ->where('is_archived', false)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start, $end])
                    ->orWhereBetween('end_date', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_date', '<=', $start)
                            ->where('end_date', '>=', $end);
                    });
            })
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'range' => 'Date range overlaps existing report.',
            ]);
        }

        $report = Report::create([
            'user_id' => auth()->id(),
            'start_date' => $start,
            'end_date' => $end,
        ]);

        $current = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        while ($current <= $endDate) {
            $report->entries()->create([
                'entry_date' => $current->toDateString(),
                'content' => '',
            ]);

            $current->addDay();
        }

        return back();
    }

    public function archive(Report $report)
    {
        $report->update(['is_archived' => true]);

        return back();
    }

    public function restore(Report $report)
    {
        $report->update(['is_archived' => false]);

        return back();
    }

    public function destroy(Report $report)
    {
        abort_unless($report->user_id === auth()->id(), 403);

        $report->delete();

        return back();
    }

    public function updatePrintDetails(UpdatePrintDetailsRequest $request, Report $report)
    {
        $report->update($request->validated());

        return back();
    }

    private function transformReports($reports)
    {
        return $reports->map(function ($report) {
            return [
                'id' => $report->id,
                'startDate' => $report->start_date->format('Y-m-d'),
                'endDate' => $report->end_date->format('Y-m-d'),
                'entries' => $report->entries->mapWithKeys(function ($entry) {
                    return [
                        $entry->entry_date->format('Y-m-d') => [
                            'id' => $entry->id,
                            'content' => $entry->content ?? '',
                        ],
                    ];
                }),
                'office' => $report->office,
                'position' => $report->position,
                'reviewer' => $report->reviewer,
                'approver' => $report->approver,
            ];
        });
    }
}
