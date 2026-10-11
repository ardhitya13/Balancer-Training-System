<?php

namespace Tests\Feature;

use Tests\TestCase;

class GramWeightTest extends TestCase
{
    public function test_overview_declares_grams_and_converted_examples(): void
    {
        $this->getJson('/api/training-overview')->assertOk()
            ->assertJsonPath('weightUnit', 'g')
            ->assertJsonPath('simulationCases.0.actualWeight', 12480)
            ->assertJsonPath('simulationCases.0.standardWeightMin', 12300)
            ->assertJsonPath('simulationCases.0.standardWeightMax', 12600);
    }

    public function test_gram_weight_boundaries_and_out_of_range(): void
    {
        foreach ([12300 => 'PASS', 12480 => 'PASS', 12600 => 'PASS', 11910 => 'NOT_PASS', 12720 => 'NOT_PASS'] as $weight => $status) {
            $this->postJson('/api/simulation/check', ['barcode' => '8990012609030001', 'weight' => $weight, 'weightUnit' => 'g'])
                ->assertOk()->assertJsonPath('status', $status)->assertJsonPath('weightUnit', 'g');
        }
    }

    public function test_missing_unit_and_invalid_weight_are_rejected(): void
    {
        $this->postJson('/api/simulation/check', ['barcode' => '8990012609030001', 'weight' => 12480])
            ->assertUnprocessable()->assertJsonValidationErrors('weightUnit');
        $this->postJson('/api/simulation/check', ['barcode' => '8990012609030001', 'weight' => 0, 'weightUnit' => 'g'])
            ->assertUnprocessable()->assertJsonValidationErrors('weight');
        $this->postJson('/api/simulation/check', ['barcode' => '8990012609030001', 'weight' => 12480, 'weightUnit' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors('weightUnit');
    }
}
