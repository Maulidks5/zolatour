<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingVoucherController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\TransportController;
use App\Http\Controllers\TransportVoucherController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\SafariRequestController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TourController as AdminTourController;
use App\Http\Controllers\Admin\TourContentController;
use App\Http\Controllers\Admin\TourImageController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\HomeContentController;
use App\Http\Controllers\Admin\TourCategoryController;
use App\Http\Controllers\Admin\SiteMediaController;
use App\Http\Controllers\ContactInquiryController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\Admin\TravelGuideController as AdminTravelGuideController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Admin\ContactInquiryController as AdminContactInquiryController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\TransportRequestController as AdminTransportRequestController;
use App\Http\Controllers\Admin\TransportRouteController as AdminTransportRouteController;
use App\Http\Controllers\Admin\PartnerController as AdminPartnerController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('/tours', [TourController::class, 'index'])->name('tours.index');
Route::get('/safaris', [TourController::class, 'safaris'])->name('safaris.index');
Route::get('/safaris/{tour}/request', [SafariRequestController::class, 'create'])->name('safaris.request');
Route::post('/safari-requests', [SafariRequestController::class, 'store'])->middleware('throttle:8,1')->name('safaris.request.store');
Route::get('/about', [PublicPageController::class, 'about'])->name('about');
Route::get('/contact', [PublicPageController::class, 'contact'])->name('contact');
Route::get('/privacy-policy', [PublicPageController::class, 'privacy'])->name('legal.privacy');
Route::get('/terms-and-conditions', [PublicPageController::class, 'terms'])->name('legal.terms');
Route::get('/booking-cancellation-policy', [PublicPageController::class, 'cancellation'])->name('legal.cancellation');
Route::get('/refund-policy', [PublicPageController::class, 'refunds'])->name('legal.refunds');
Route::get('/tours/{tour}', [TourController::class, 'show'])->name('tours.show');
Route::get('/safaris/{tour}', [TourController::class, 'showSafari'])->name('safaris.show');
Route::get('/transfers', [TransportController::class, 'index'])->name('transport.index');
Route::post('/transfers', [TransportController::class, 'store'])->middleware('throttle:8,1')->name('transport.store');
Route::get('/transfer-booking/{transportRequest}/success', [TransportController::class, 'success'])->middleware('signed')->name('transport.success');
Route::get('/transfer-booking/{transportRequest}/voucher', TransportVoucherController::class)->middleware(['signed', 'throttle:20,1'])->name('transport.voucher');

Route::get('/book/{tour}', [BookingController::class, 'create'])->name('bookings.create');
Route::post('/bookings', [BookingController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('bookings.store');
Route::get('/booking/{booking}/success', [BookingController::class, 'success'])
    ->middleware('signed')
    ->name('bookings.success');
Route::get('/booking/{booking}/voucher', BookingVoucherController::class)
    ->middleware(['signed', 'throttle:20,1'])
    ->name('bookings.voucher');
Route::post('/contact', [ContactInquiryController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::get('/feedback', [TestimonialController::class, 'create'])->name('feedback.create');
Route::post('/feedback', [TestimonialController::class, 'store'])->middleware('throttle:5,1')->name('feedback.store');

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AdminAuthController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AdminAuthController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('admin.login.store');
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin', 'admin.session'])->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::post('/logout', [AdminAuthController::class, 'destroy'])->name('logout');
    Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [AdminBookingController::class, 'show'])->name('bookings.show');
    Route::patch('/bookings/{booking}', [AdminBookingController::class, 'update'])->name('bookings.update');
    Route::delete('/bookings/{booking}', [AdminBookingController::class, 'destroy'])->name('bookings.destroy');
    Route::patch('/bookings/{reference}/restore', [AdminBookingController::class, 'restore'])->name('bookings.restore');
    Route::delete('/bookings/{reference}/force', [AdminBookingController::class, 'forceDestroy'])->name('bookings.force-destroy');
    Route::get('/tours', [AdminTourController::class, 'index'])->name('tours.index');
    Route::get('/tours/create', [AdminTourController::class, 'create'])->name('tours.create');
    Route::post('/tours', [AdminTourController::class, 'store'])->name('tours.store');
    Route::get('/cms/settings', [SiteSettingController::class, 'edit'])->name('cms.settings.edit');
    Route::patch('/cms/settings', [SiteSettingController::class, 'update'])->name('cms.settings.update');
    Route::get('/cms/home', [HomeContentController::class, 'edit'])->name('cms.home.edit');
    Route::put('/cms/home', [HomeContentController::class, 'update'])->name('cms.home.update');
    Route::get('/cms/categories', [TourCategoryController::class, 'index'])->name('cms.categories.index');
    Route::post('/cms/categories', [TourCategoryController::class, 'store'])->name('cms.categories.store');
    Route::post('/cms/categories/{category}', [TourCategoryController::class, 'update'])->name('cms.categories.update');
    Route::get('/cms/media', [SiteMediaController::class, 'edit'])->name('cms.media.edit');
    Route::post('/cms/media', [SiteMediaController::class, 'update'])->name('cms.media.update');
    Route::get('/inquiries', [AdminContactInquiryController::class, 'index'])->name('inquiries.index');
    Route::get('/inquiries/{inquiry}', [AdminContactInquiryController::class, 'show'])->name('inquiries.show');
    Route::patch('/inquiries/{inquiry}', [AdminContactInquiryController::class, 'update'])->name('inquiries.update');
    Route::delete('/inquiries/{inquiry}', [AdminContactInquiryController::class, 'destroy'])->name('inquiries.destroy');
    Route::patch('/inquiries/{reference}/restore', [AdminContactInquiryController::class, 'restore'])->name('inquiries.restore');
    Route::delete('/inquiries/{reference}/force', [AdminContactInquiryController::class, 'forceDestroy'])->name('inquiries.force-destroy');
    Route::get('/transport-requests', [AdminTransportRequestController::class, 'index'])->name('transport-requests.index');
    Route::get('/transport-requests/{transportRequest}', [AdminTransportRequestController::class, 'show'])->name('transport-requests.show');
    Route::patch('/transport-requests/{transportRequest}', [AdminTransportRequestController::class, 'update'])->name('transport-requests.update');
    Route::delete('/transport-requests/{transportRequest}', [AdminTransportRequestController::class, 'destroy'])->name('transport-requests.destroy');
    Route::patch('/transport-requests/{reference}/restore', [AdminTransportRequestController::class, 'restore'])->name('transport-requests.restore');
    Route::delete('/transport-requests/{reference}/force', [AdminTransportRequestController::class, 'forceDestroy'])->name('transport-requests.force-destroy');
    Route::get('/transport-routes', [AdminTransportRouteController::class, 'index'])->name('transport-routes.index');
    Route::post('/transport-routes', [AdminTransportRouteController::class, 'store'])->name('transport-routes.store');
    Route::patch('/transport-routes/{transportRoute}', [AdminTransportRouteController::class, 'update'])->name('transport-routes.update');
    Route::delete('/transport-routes/{transportRoute}', [AdminTransportRouteController::class, 'destroy'])->name('transport-routes.destroy');
    Route::get('/testimonials', [AdminTestimonialController::class, 'index'])->name('testimonials.index');
    Route::patch('/testimonials/{testimonial}', [AdminTestimonialController::class, 'update'])->name('testimonials.update');
    Route::delete('/testimonials/{testimonial}', [AdminTestimonialController::class, 'destroy'])->name('testimonials.destroy');
    Route::patch('/testimonials/{reference}/restore', [AdminTestimonialController::class, 'restore'])->name('testimonials.restore');
    Route::delete('/testimonials/{reference}/force', [AdminTestimonialController::class, 'forceDestroy'])->name('testimonials.force-destroy');
    Route::patch('/testimonials/{reference}/restore', [AdminTestimonialController::class, 'restore'])->name('testimonials.restore');
    Route::delete('/testimonials/{reference}/force', [AdminTestimonialController::class, 'forceDestroy'])->name('testimonials.force-destroy');
    Route::get('/guides', [AdminTravelGuideController::class, 'index'])->name('guides.index');
    Route::post('/guides', [AdminTravelGuideController::class, 'store'])->name('guides.store');
    Route::post('/guides/{guide}', [AdminTravelGuideController::class, 'update'])->name('guides.update');
    Route::delete('/guides/{guide}', [AdminTravelGuideController::class, 'destroy'])->name('guides.destroy');
    Route::get('/faqs', [AdminFaqController::class, 'index'])->name('faqs.index');
    Route::post('/faqs', [AdminFaqController::class, 'store'])->name('faqs.store');
    Route::patch('/faqs/{faq}', [AdminFaqController::class, 'update'])->name('faqs.update');
    Route::delete('/faqs/{faq}', [AdminFaqController::class, 'destroy'])->name('faqs.destroy');
    Route::get('/cms/partners', [AdminPartnerController::class, 'index'])->name('cms.partners.index');
    Route::post('/cms/partners', [AdminPartnerController::class, 'store'])->name('cms.partners.store');
    Route::patch('/cms/partners/{partner}', [AdminPartnerController::class, 'update'])->name('cms.partners.update');
    Route::delete('/cms/partners/{partner}', [AdminPartnerController::class, 'destroy'])->name('cms.partners.destroy');
    Route::get('/cms/hero-slides', [HeroSlideController::class, 'index'])->name('cms.hero-slides.index');
    Route::post('/cms/hero-slides', [HeroSlideController::class, 'store'])->name('cms.hero-slides.store');
    Route::post('/cms/hero-slides/{slide}', [HeroSlideController::class, 'update'])->name('cms.hero-slides.update');
    Route::delete('/cms/hero-slides/{slide}', [HeroSlideController::class, 'destroy'])->name('cms.hero-slides.destroy');

    Route::middleware('can:manage-users')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    });
    Route::get('/tours/{tour}/edit', [AdminTourController::class, 'edit'])->name('tours.edit');
    Route::post('/tours/{tour}', [AdminTourController::class, 'update'])->name('tours.update');
    Route::post('/tours/{tour}/content', [TourContentController::class, 'update'])->name('tours.content.update');
    Route::post('/tours/{tour}/images', [TourImageController::class, 'store'])->name('tours.images.store');
    Route::patch('/tours/{tour}/images/{image}', [TourImageController::class, 'update'])->name('tours.images.update');
    Route::delete('/tours/{tour}/images/{image}', [TourImageController::class, 'destroy'])->name('tours.images.destroy');
});
