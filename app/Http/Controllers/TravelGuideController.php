<?php

namespace App\Http\Controllers;

use App\Models\TravelGuide;
use App\Models\Tour;
use Inertia\Inertia;
use Inertia\Response;

class TravelGuideController extends Controller
{
 public function index(): Response
 {
  return Inertia::render('Guides/Index', ['guides' => TravelGuide::query()->published()->orderByDesc('is_featured')->orderByDesc('published_at')->get()->map(fn ($g) => $this->card($g))]);
 }
 public function show(TravelGuide $guide): Response
 {
  abort_unless($guide->is_published && $guide->published_at?->isPast(), 404);
  $slugs = match ($guide->slug) {
   'zanzibar-airport-transfer-guide' => ['prison-island','spice-tour','kendwa-beach'],
   'safari-from-zanzibar-what-to-expect' => ['safari-zanzibar-beach-escape','tanzania-safaris','safari-blue'],
   'best-zanzibar-tours-for-couples' => ['nakupenda-beach','mnemba-island','nungwi-turtles-sunset'],
   'best-zanzibar-tours-for-families' => ['prison-island','jozani-forest','spice-tour'],
   default => ['safari-blue','prison-island-nakupenda','spice-prison-stone-town'],
  };
  $tours = Tour::query()->published()->whereIn('slug',$slugs)->with('category:id,name')->get()->sortBy(fn($tour)=>array_search($tour->slug,$slugs))->values()->map(fn($tour)=>[
   'slug'=>$tour->slug,'title'=>$tour->title,'description'=>$tour->excerpt,'duration'=>$tour->duration,'location'=>$tour->location,'rating'=>(float)$tour->rating,'reviewsCount'=>$tour->reviews_count,'price'=>(float)$tour->price,'currency'=>$tour->currency,'image'=>$tour->cover_image_path,'category'=>$tour->category?->name,'experienceType'=>$tour->experience_type,'minimumAge'=>$tour->minimum_age,'difficulty'=>$tour->difficulty,
  ]);
  return Inertia::render('Guides/Show', ['guide'=>[...$this->card($guide),'content'=>$guide->content,'metaTitle'=>$guide->meta_title,'metaDescription'=>$guide->meta_description],'relatedTours'=>$tours]);
 }
 private function card(TravelGuide $guide): array { return ['slug'=>$guide->slug,'title'=>$guide->title,'category'=>$guide->category,'excerpt'=>$guide->excerpt,'image'=>$guide->image_path,'readingTime'=>$guide->reading_time,'publishedAt'=>$guide->published_at?->toDateString(),'featured'=>$guide->is_featured]; }
}
