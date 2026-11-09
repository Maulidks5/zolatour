<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
class PartnerController extends Controller
{
    public function index(): Response { return Inertia::render('Admin/Cms/Partners', ['partners' => Partner::query()->orderBy('sort_order')->get()->map(fn (Partner $p) => ['id'=>$p->id,'name'=>$p->name,'icon'=>$p->icon,'url'=>$p->url,'sortOrder'=>$p->sort_order,'isActive'=>$p->is_active])]); }
    public function store(Request $request): RedirectResponse { Partner::query()->create($this->validated($request)); return back()->with('success', 'Partner added.'); }
    public function update(Request $request, Partner $partner): RedirectResponse { $partner->update($this->validated($request)); return back()->with('success', 'Partner updated.'); }
    public function destroy(Partner $partner): RedirectResponse { $partner->delete(); return back()->with('success', 'Partner removed.'); }
    private function validated(Request $request): array { return $request->validate(['name'=>['required','string','max:120'],'icon'=>['required',Rule::in(['hotel','guide','camp','transport','company'])],'url'=>['nullable','url','max:500'],'sort_order'=>['required','integer','min:0','max:999'],'is_active'=>['required','boolean']]); }
}
