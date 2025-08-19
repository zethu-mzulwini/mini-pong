Route::get('/pong', function () {
    return view('pong');
});
Route::get('/pong/{player}', function ($player) {
    return view('pong', ['player' => $player]);
});