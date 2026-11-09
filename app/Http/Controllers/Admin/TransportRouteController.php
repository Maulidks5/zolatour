<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportRoute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransportRouteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Transport/Routes', ['routes' => TransportRoute::query()->orderBy('sort_order')->orderBy('pickup_location')->get()->map(fn ($route) => $this->data($route))]);
    }

    public function store(Request $request): RedirectResponse
    {
        TransportRoute::query()->create($this->validated($request));
        return back()->with('success', 'Transport route and prices added.');
    }

    public function update(Request $request, TransportRoute $transportRoute): RedirectResponse
    {
        $transportRoute->update($this->validated($request));
        return back()->with('success', 'Transport route prices updated.');
    }

    public function destroy(TransportRoute $transportRoute): RedirectResponse
    {
        $transportRoute->delete();
        return back()->with('success', 'Transport route removed. Existing requests were preserved.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'pickup_location'=>['required','string','max:190'], 'destination'=>['required','string','max:190'],
            'currency'=>['required','string','size:3'], 'sedan_price'=>['nullable','numeric','min:0','max:999999'],
            'suv_minivan_price'=>['nullable','numeric','min:0','max:999999'], 'van_price'=>['nullable','numeric','min:0','max:999999'],
            'minibus_price'=>['nullable','numeric','min:0','max:999999'], 'return_discount_percent'=>['required','numeric','min:0','max:50'],
            'night_surcharge'=>['required','numeric','min:0','max:999999'], 'night_start'=>['required','date_format:H:i'],
            'night_end'=>['required','date_format:H:i'], 'child_seat_fee'=>['required','numeric','min:0','max:999999'],
            'is_bidirectional'=>['boolean'], 'is_active'=>['boolean'], 'sort_order'=>['required','integer','min:0','max:9999'],
        ]);
    }

    private function data(TransportRoute $route): array
    {
        return ['id'=>$route->id, 'pickupLocation'=>$route->pickup_location, 'destination'=>$route->destination, 'currency'=>$route->currency,
            'sedanPrice'=>$route->sedan_price !== null ? (float)$route->sedan_price : null, 'suvMinivanPrice'=>$route->suv_minivan_price !== null ? (float)$route->suv_minivan_price : null,
            'vanPrice'=>$route->van_price !== null ? (float)$route->van_price : null, 'minibusPrice'=>$route->minibus_price !== null ? (float)$route->minibus_price : null,
            'returnDiscountPercent'=>(float)$route->return_discount_percent, 'nightSurcharge'=>(float)$route->night_surcharge,
            'nightStart'=>substr($route->night_start,0,5), 'nightEnd'=>substr($route->night_end,0,5), 'childSeatFee'=>(float)$route->child_seat_fee,
            'isBidirectional'=>$route->is_bidirectional, 'isActive'=>$route->is_active, 'sortOrder'=>$route->sort_order];
    }
}
