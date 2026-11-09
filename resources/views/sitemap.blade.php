<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
@foreach ($pages as $page)
    <url>
        <loc>{{ $page['url'] }}</loc>
        <changefreq>{{ $page['frequency'] }}</changefreq>
        <priority>{{ $page['priority'] }}</priority>
    </url>
@endforeach
@foreach ($guides as $guide)
    <url>
        <loc>{{ route('guides.show', $guide) }}</loc>
        <lastmod>{{ $guide->updated_at->toAtomString() }}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
@endforeach
@foreach ($tours as $tour)
    <url>
        <loc>{{ route('tours.show', $tour) }}</loc>
        <lastmod>{{ $tour->updated_at->toAtomString() }}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
@endforeach
</urlset>
