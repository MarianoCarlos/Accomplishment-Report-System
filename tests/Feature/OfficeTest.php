<?php

use App\Models\User;
use App\Models\Office;

it('can create an office', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/offices', [
            'name' => 'IT Department',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('offices', [
        'name' => 'IT Department',
    ]);
});
