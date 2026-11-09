<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TravelGuide;
use App\Support\WebImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TravelGuideController extends Controller
{
 public function index(): Response { return Inertia::render('Admin/Guides/Index',['guides'=>TravelGuide::query()->orderByDesc('updated_at')->get()->map(fn($g)=>['id'=>$g->id,'title'=>$g->title,'slug'=>$g->slug,'category'=>$g->category,'excerpt'=>$g->excerpt,'content'=>$g->content,'imagePath'=>$g->image_path,'readingTime'=>$g->reading_time,'featured'=>$g->is_featured,'published'=>$g->is_published,'metaTitle'=>$g->meta_title,'metaDescription'=>$g->meta_description])]); }
 public function store(Request $request, WebImageStorage $images): RedirectResponse { $data=$this->validated($request); unset($data['image']); $data['published_at']=$data['is_published']?now():null; $guide=TravelGuide::query()->create($data); if($request->hasFile('image')) $guide->update(['image_path'=>'/storage/'.$images->store($request->file('image'),'guides',1800)]); return back()->with('success','Travel guide created.'); }
 public function update(Request $request, TravelGuide $guide, WebImageStorage $images): RedirectResponse { $data=$this->validated($request,$guide); unset($data['image']); $data['published_at']=$data['is_published']?($guide->published_at??now()):null; if($request->hasFile('image')) { $old=$guide->image_path; $data['image_path']='/storage/'.$images->store($request->file('image'),'guides',1800); if($old&&Str::startsWith($old,'/storage/')) Storage::disk('public')->delete(Str::after($old,'/storage/')); } $guide->update($data); return back()->with('success','Travel guide updated.'); }
 public function destroy(TravelGuide $guide): RedirectResponse { if($guide->image_path&&Str::startsWith($guide->image_path,'/storage/')) Storage::disk('public')->delete(Str::after($guide->image_path,'/storage/')); $guide->delete(); return back()->with('success','Travel guide removed.'); }
 private function validated(Request $request, ?TravelGuide $guide=null): array { return $request->validate(['title'=>['required','string','max:180'],'slug'=>['required','alpha_dash','max:190',Rule::unique('travel_guides','slug')->ignore($guide)],'category'=>['required','string','max:80'],'excerpt'=>['required','string','max:500'],'content'=>['required','string','max:30000'],'reading_time'=>['required','integer','min:1','max:60'],'image'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:8192'],'is_featured'=>['boolean'],'is_published'=>['boolean'],'meta_title'=>['nullable','string','max:190'],'meta_description'=>['nullable','string','max:320']]); }
}
