<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Zola Tours & Safaris — simple, memorable Zanzibar tours planned by a local team.">
        <meta name="theme-color" content="#063b52">
        <meta name="robots" content="{{ request()->is('admin*') ? 'noindex,nofollow' : 'index,follow' }}">
        <link rel="canonical" href="{{ url()->current() }}">
        <link rel="icon" type="image/png" sizes="256x256" href="/brand/favicon-zola.png?v=3">
        <link rel="apple-touch-icon" href="/brand/favicon-zola.png?v=3">

        <title inertia>Zola Tours & Safaris</title>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
