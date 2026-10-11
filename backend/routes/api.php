<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

$trainingData = [
    'weightUnit' => 'g',
    'trainee' => [
        'name' => 'Ardhitya',
        'role' => 'Trainee Operator',
        'program' => 'Balancer Training Program',
        'shift' => 'Morning Shift',
    ],
    'progress' => [
        'overall' => 65,
        'completedMaterials' => 3,
        'totalMaterials' => 5,
        'completedQuizzes' => 1,
        'totalQuizzes' => 2,
        'simulationStatus' => 'Not completed',
    ],
    'modules' => [
        [
            'id' => 1,
            'code' => '01',
            'title' => 'Introduction to Balancer',
            'description' => 'Overview proses training, area kerja, dan alur pemeriksaan box.',
            'progress' => 100,
            'status' => 'completed',
        ],
        [
            'id' => 2,
            'code' => '02',
            'title' => 'Lot and Box Identification',
            'description' => 'Memahami lot number, barcode dummy, box number, dan quantity.',
            'progress' => 100,
            'status' => 'completed',
        ],
        [
            'id' => 3,
            'code' => '03',
            'title' => 'Weight Checking Process',
            'description' => 'Latihan membaca standar berat dan membandingkan aktual box.',
            'progress' => 70,
            'status' => 'in_progress',
        ],
        [
            'id' => 4,
            'code' => '04',
            'title' => 'Barcode and Data Entry',
            'description' => 'Simulasi input barcode dan validasi informasi produksi dummy.',
            'progress' => 0,
            'status' => 'locked',
        ],
        [
            'id' => 5,
            'code' => '05',
            'title' => 'Balancer Simulation',
            'description' => 'Praktik kasus PASS dan NOT PASS berdasarkan rentang berat.',
            'progress' => 0,
            'status' => 'locked',
        ],
    ],
    'simulationCases' => [
        [
            'id' => 1,
            'lotNumber' => 'LOT-260903-A01',
            'barcode' => '8990012609030001',
            'boxNumber' => 'BX-004',
            'quantity' => 24,
            'standardWeightMin' => 12300,
            'standardWeightMax' => 12600,
            'actualWeight' => 12480,
            'expectedStatus' => 'PASS',
            'scenarioType' => 'Normal weight',
        ],
        [
            'id' => 2,
            'lotNumber' => 'LOT-260903-A01',
            'barcode' => '8990012609030002',
            'boxNumber' => 'BX-005',
            'quantity' => 24,
            'standardWeightMin' => 12300,
            'standardWeightMax' => 12600,
            'actualWeight' => 11910,
            'expectedStatus' => 'NOT_PASS',
            'scenarioType' => 'Under weight',
        ],
        [
            'id' => 3,
            'lotNumber' => 'LOT-260903-A02',
            'barcode' => '8990012609030003',
            'boxNumber' => 'BX-011',
            'quantity' => 24,
            'standardWeightMin' => 12300,
            'standardWeightMax' => 12600,
            'actualWeight' => 12720,
            'expectedStatus' => 'NOT_PASS',
            'scenarioType' => 'Over weight',
        ],
    ],
    'quiz' => [
        'passingGrade' => 80,
        'questions' => [
            [
                'id' => 1,
                'question' => 'Informasi apa yang perlu dicek sebelum proses weight checking?',
                'options' => ['Lot number saja', 'Box number saja', 'Quantity saja', 'Lot, box, quantity, dan barcode'],
                'answer' => 3,
            ],
            [
                'id' => 2,
                'question' => 'Jika actual weight berada di bawah standard weight minimum, status yang benar adalah...',
                'options' => ['PASS', 'NOT PASS', 'Continue tanpa catatan', 'Ubah lot number'],
                'answer' => 1,
            ],
            [
                'id' => 3,
                'question' => 'Prototype ini menggunakan data apa untuk menjaga keamanan informasi perusahaan?',
                'options' => ['Data produksi asli', 'Data customer', 'Dummy/synthetic data', 'Password admin'],
                'answer' => 2,
            ],
            [
                'id' => 4,
                'question' => 'Tujuan utama simulator balancer adalah...',
                'options' => ['Mengganti SOP resmi', 'Melatih keputusan PASS/NOT PASS', 'Menghapus proses trainer', 'Mengubah database produksi'],
                'answer' => 1,
            ],
        ],
    ],
    'adminOverview' => [
        'trainees' => 32,
        'completed' => 25,
        'inProgress' => 5,
        'needRetest' => 2,
    ],
];

Route::get('/health', fn () => response()->json(['status' => 'ok']));
Route::get('/training-overview', fn () => response()->json($trainingData));

Route::post('/simulation/check', function (Request $request) use ($trainingData) {
    $payload = $request->validate([
        'barcode' => ['required', 'string'],
        'weight' => ['required', 'numeric', 'gt:0'],
        'weightUnit' => ['required', 'in:g'],
    ]);

    $case = collect($trainingData['simulationCases'])->firstWhere('barcode', $payload['barcode']);

    if (! $case) {
        return response()->json([
            'status' => 'NOT_PASS',
            'message' => 'Barcode tidak ditemukan pada data training dummy.',
        ], 422);
    }

    $weight = (float) $payload['weight'];
    $passes = $weight >= $case['standardWeightMin'] && $weight <= $case['standardWeightMax'];

    return response()->json([
        'status' => $passes ? 'PASS' : 'NOT_PASS',
        'case' => $case,
        'actualWeight' => $weight,
        'weightUnit' => 'g',
        'message' => $passes ? 'Berat sesuai rentang gram.' : 'Berat di luar rentang gram.',
    ]);
});
