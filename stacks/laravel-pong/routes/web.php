<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('pong');
});
Route::get('/pong/{player}', function ($player) {
    return view('pong', ['player' => $player]);
});