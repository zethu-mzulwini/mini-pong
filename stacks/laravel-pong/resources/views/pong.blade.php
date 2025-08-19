@extends('layouts.app')

@section('content')
  <h1>Laravel Pong</h1>
  <canvas id="gameCanvas" width="800" height="500"></canvas>
  <script src="{{ asset('js/game.js') }}"></script>
@endsection
