<?php

namespace App\Http\Controllers;

use App\Models\Office;
use App\Http\Requests\StoreOfficeRequest;
use App\Http\Requests\UpdateOfficeRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OfficeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Offices/Index', [
            'offices' => Office::orderBy('name')->get(),
        ]);
    }

    public function store(StoreOfficeRequest $request): RedirectResponse
    {
        Office::create($request->validated());

        return redirect()->back();
    }

    public function update(UpdateOfficeRequest $request, Office $office): RedirectResponse
    {
        $office->update($request->validated());

        return redirect()->back();
    }

    public function destroy(Office $office): RedirectResponse
    {
        $office->delete();

        return redirect()->back();
    }
}
