<?php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Http\Requests\StorePositionRequest;
use App\Http\Requests\UpdatePositionRequest;
use Illuminate\Http\RedirectResponse;

class PositionController extends Controller
{
    public function store(StorePositionRequest $request): RedirectResponse
    {
        Position::create($request->validated());

        return redirect()->back();
    }

    public function update(UpdatePositionRequest $request, Position $position): RedirectResponse
    {
        $position->update($request->validated());

        return redirect()->back();
    }

    public function destroy(Position $position): RedirectResponse
    {
        $position->delete();

        return redirect()->back();
    }
}
