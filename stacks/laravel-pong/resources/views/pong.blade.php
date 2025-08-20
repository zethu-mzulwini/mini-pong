<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @extends('layouts.app')
        
        @section('content')
          <h1>Laravel Pong</h1>
          <canvas id="gameCanvas" width="800" height="500"></canvas>
          <script src="{{ asset('js/game.js') }}"></script>
        @endsection
    </body>
</html>