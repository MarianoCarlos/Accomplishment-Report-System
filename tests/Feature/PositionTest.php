<?php

use App\Models\User;
use App\Models\Position;

it('can create a position', function () {
    $user = User::factory()->create(['role' => 'Admin']);

    $this->actingAs($user)
        ->post('/positions', [
            'name' => 'Senior Manager',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('positions', [
        'name' => 'Senior Manager',
    ]);
});

it('can update a position', function () {
    $user = User::factory()->create(['role' => 'Admin']);
    $position = Position::factory()->create(['name' => 'Junior Developer']);

    $this->actingAs($user)
        ->put("/positions/{$position->id}", [
            'name' => 'Senior Developer',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('positions', [
        'id' => $position->id,
        'name' => 'Senior Developer',
    ]);
});

it('can delete a position', function () {
    $user = User::factory()->create(['role' => 'Admin']);
    $position = Position::factory()->create();

    $this->actingAs($user)
        ->delete("/positions/{$position->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('positions', [
        'id' => $position->id,
    ]);
});
