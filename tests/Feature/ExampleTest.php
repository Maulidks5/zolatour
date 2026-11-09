<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\Booking;
use App\Models\User;
use App\Mail\NewWebsiteSubmission;
use App\Mail\BookingConfirmationMail;
use App\Mail\TransportConfirmationMail;
use App\Models\TransportRequest;
use Database\Seeders\DatabaseSeeder;
use App\Models\SiteSetting;
use App\Models\HeroSlide;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\TravelGuide;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_about_and_contact_pages_are_available(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get('/about')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('content.title', 'Meaningful journeys, planned with local care')
                ->has('values'));

        $this->get('/contact')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('content.title', "Let's plan your Zanzibar experience"));
    }

    public function test_transfer_page_has_priced_routes_and_stores_an_automatic_return_quote(): void
    {
        Mail::fake();
        $this->seed(DatabaseSeeder::class);

        $this->get('/transfers')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Transport', false)
                ->has('pricedRoutes', 9));

        $travelDate = now()->addWeek()->toDateString();
        $response = $this->post('/transfers', [
            'full_name' => 'Transfer Guest',
            'phone' => '+255775110089',
            'email' => 'transfer@example.com',
            'service_type' => 'airport-transfer',
            'trip_type' => 'return',
            'hire_duration' => '',
            'pickup_location' => 'Airport',
            'destination' => 'Nungwi',
            'travel_date' => $travelDate,
            'pickup_time' => '10:00',
            'return_date' => now()->addDays(10)->toDateString(),
            'return_time' => '12:00',
            'passengers' => 4,
            'luggage' => 4,
            'child_seats' => 0,
            'airport_direction' => 'arrival',
            'airline' => '',
            'flight_number' => 'TC 101',
            'vehicle_category' => 'suv-minivan',
            'notes' => '',
            'consent' => true,
            'website' => '',
        ])->assertRedirect();

        $this->assertDatabaseHas('transport_requests', [
            'full_name' => 'Transfer Guest',
            'estimated_price' => 99,
            'estimated_currency' => 'USD',
            'vehicle_category' => 'suv-minivan',
            'status' => 'confirmed',
        ]);

        $booking = TransportRequest::query()->where('full_name', 'Transfer Guest')->firstOrFail();
        $this->get($response->headers->get('Location'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('TransportSuccess', false)
                ->where('booking.reference', $booking->reference)
                ->where('booking.price', 99));
        Mail::assertQueued(TransportConfirmationMail::class, fn (TransportConfirmationMail $mail) => $mail->booking->is($booking));
        $voucherUrl = URL::temporarySignedRoute('transport.voucher', now()->addHour(), ['transportRequest' => $booking]);
        $this->get($voucherUrl)->assertOk()->assertHeader('content-type', 'application/pdf');
    }

    public function test_search_engines_receive_public_sitemap_and_safe_robots_rules(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee(route('home'), false)
            ->assertSee(route('tours.show', 'safari-blue'), false);

        $this->get('/robots.txt')
            ->assertOk()
            ->assertSee('Allow: /', false)
            ->assertSee('Disallow: /admin', false)
            ->assertSee(route('sitemap'), false);
    }

    public function test_public_faq_and_admin_management_work(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->get('/faq')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('groups'));

        $admin = User::factory()->create(['is_admin' => true, 'is_active' => true]);
        $this->actingAs($admin)->get('/admin/faqs')->assertOk();
        $this->actingAs($admin)->post('/admin/faqs', [
            'category' => 'Private tours',
            'question' => 'Can we book a private experience?',
            'answer' => 'Yes. Share your preferred date and group size with our team.',
            'sort_order' => 20,
            'is_active' => true,
        ])->assertRedirect();

        $faq = Faq::query()->where('question', 'Can we book a private experience?')->firstOrFail();
        $this->actingAs($admin)->patch("/admin/faqs/{$faq->id}", [
            'category' => $faq->category,
            'question' => $faq->question,
            'answer' => 'Yes. Private arrangements depend on availability.',
            'sort_order' => 9,
            'is_active' => false,
        ])->assertRedirect();
        $this->assertDatabaseHas('faqs', ['id' => $faq->id, 'sort_order' => 9, 'is_active' => false]);

        $this->actingAs($admin)->delete("/admin/faqs/{$faq->id}")->assertRedirect();
        $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
    }

    public function test_customer_feedback_requires_admin_approval_before_display(): void
    {
        $this->get('/feedback')->assertOk();

        $this->post('/feedback', [
            'name' => 'Happy Traveller',
            'email' => 'traveller@example.com',
            'country' => 'Germany',
            'tour_name' => 'Safari Blue',
            'rating' => 5,
            'content' => 'The local team was helpful and the whole experience was beautifully organised.',
            'website' => '',
        ])->assertRedirect();

        $review = Testimonial::query()->firstOrFail();
        $this->assertSame('pending', $review->status);
        $this->assertNull($review->approved_at);

        $owner = User::factory()->create(['is_admin' => true, 'role' => 'super_admin', 'is_active' => true]);
        $this->actingAs($owner)
            ->patch("/admin/testimonials/{$review->reference}", ['status' => 'approved', 'is_featured' => true])
            ->assertRedirect();

        $review->refresh();
        $this->assertSame('approved', $review->status);
        $this->assertTrue($review->is_featured);
        $this->assertNotNull($review->approved_at);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('testimonials', 1)
                ->where('testimonials.0.name', 'Happy Traveller')
                ->missing('testimonials.0.email'));

        $this->delete("/admin/testimonials/{$review->reference}")->assertRedirect();
        $this->assertSoftDeleted('testimonials', ['reference' => $review->reference]);
        $this->patch("/admin/testimonials/{$review->reference}/restore")->assertRedirect();
        $this->assertDatabaseHas('testimonials', ['reference' => $review->reference, 'deleted_at' => null]);
    }

    public function test_safari_request_can_use_whatsapp_without_email(): void
    {
        $this->post('/safari-requests', [
            'name' => 'Safari Guest',
            'preferred_contact' => 'whatsapp',
            'email' => '',
            'whatsapp' => '+255671921474',
            'start_date' => now()->addMonth()->toDateString(),
            'days' => 3,
            'adults' => 2,
            'children' => 0,
            'parks' => ['Mikumi'],
            'accommodation' => 'Mid-range',
            'arrival_point' => 'Zanzibar',
            'budget' => '',
            'notes' => '',
            'consent' => true,
            'website' => '',
        ])->assertRedirect();

        $this->assertDatabaseHas('contact_inquiries', [
            'name' => 'Safari Guest',
            'email' => null,
            'phone' => '+255671921474',
            'preferred_contact' => 'whatsapp',
            'source' => 'safari',
        ]);
    }

    public function test_admin_can_manage_archive_and_restore_a_safari_request(): void
    {
        $this->test_safari_request_can_use_whatsapp_without_email();
        $inquiry = \App\Models\ContactInquiry::query()->where('source', 'safari')->firstOrFail();
        $admin = User::factory()->create(['is_admin' => true, 'is_active' => true]);

        $this->actingAs($admin)->get("/admin/inquiries/{$inquiry->reference}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Inquiries/Show', false)
                ->where('inquiry.reference', $inquiry->reference)
                ->where('inquiry.details.Parks', 'Mikumi'));

        $this->actingAs($admin)->patch("/admin/inquiries/{$inquiry->reference}", [
            'status' => 'planning',
            'admin_notes' => 'Prepare a three-day Mikumi option.',
        ])->assertRedirect();
        $this->assertDatabaseHas('contact_inquiries', ['id' => $inquiry->id, 'status' => 'planning', 'admin_notes' => 'Prepare a three-day Mikumi option.']);

        $this->actingAs($admin)->delete("/admin/inquiries/{$inquiry->reference}")->assertRedirect('/admin/inquiries');
        $this->assertSoftDeleted('contact_inquiries', ['id' => $inquiry->id]);
        $this->actingAs($admin)->get('/admin/inquiries?archived=1')->assertOk();
        $this->actingAs($admin)->patch("/admin/inquiries/{$inquiry->reference}/restore")->assertRedirect();
        $this->assertNotSoftDeleted('contact_inquiries', ['id' => $inquiry->id]);
    }

    public function test_completed_booking_has_a_secure_single_use_feedback_link(): void
    {
        $this->seed(DatabaseSeeder::class);
        $tour = Tour::query()->firstOrFail();
        $booking = $tour->bookings()->create([
            'reference' => 'CRT-FEEDBACK-001',
            'full_name' => 'Feedback Guest',
            'email' => 'guest@example.com',
            'whatsapp' => '+255700000000',
            'travel_date' => now()->subDay(),
            'adults' => 2,
            'children' => 0,
            'status' => 'completed',
        ]);
        $admin = User::factory()->create(['is_admin' => true, 'is_active' => true]);

        $this->actingAs($admin)
            ->get("/admin/bookings/{$booking->reference}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('booking.feedbackUrl', fn ($url) => is_string($url) && str_contains($url, '/feedback?')));

        $feedbackUrl = URL::signedRoute('feedback.create', ['booking' => $booking->reference]);
        $this->get($feedbackUrl)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('prefill.name', 'Feedback Guest')
                ->where('prefill.email', 'guest@example.com')
                ->where('prefill.bookingReference', $booking->reference)
                ->where('prefill.alreadySubmitted', false));

        $payload = [
            'booking_reference' => $booking->reference,
            'name' => 'Feedback Guest',
            'email' => 'guest@example.com',
            'country' => 'Germany',
            'tour_name' => $tour->title,
            'rating' => 5,
            'content' => 'A wonderful experience with an organised and caring local team.',
            'website' => '',
        ];

        $this->post($feedbackUrl, $payload)->assertRedirect();
        $this->assertDatabaseHas('testimonials', ['booking_id' => $booking->id, 'status' => 'pending']);
        $this->post($feedbackUrl, $payload)->assertSessionHasErrors('content');
        $this->assertSame(1, Testimonial::query()->where('booking_id', $booking->id)->count());
    }

    public function test_published_tour_pages_are_available(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get('/tours')->assertOk();
        $this->get('/safaris')->assertOk();
        $this->get('/tour-finder')->assertOk()->assertInertia(fn (Assert $page) => $page->has('tours', 27));
        $this->get('/guides')->assertOk()->assertInertia(fn (Assert $page) => $page->has('guides', 6));
        $this->get('/guides/best-time-to-visit-zanzibar')->assertOk();
        $this->get('/tours/safari-blue')->assertOk();
        $this->get('/tours/jet-ski-adventure')->assertOk();
        $this->get('/tours/prison-island-nakupenda')->assertOk();
        $this->get('/tours/safari-zanzibar-beach-escape')->assertOk();
        $this->get('/tours/unknown-tour')->assertNotFound();
        $this->assertDatabaseCount('tours', 27);
    }

    public function test_tour_catalogue_can_be_searched_filtered_sorted_and_paginated(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get('/tours?q=Mnemba')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.q', 'Mnemba')
                ->where('tours.total', 1)
                ->has('tours.data', 1)
                ->where('tours.data.0.slug', 'mnemba-island'));

        $this->get('/tours?type=water_sport&sort=price_low')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.type', 'water_sport')
                ->where('filters.sort', 'price_low')
                ->where('tours.data.0.experienceType', 'water_sport'));

        $this->get('/tours?page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('tours.current_page', 2));

        $this->get('/safaris')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Safaris', false)
                ->where('pageTitle', 'Safari journeys planned around you'));
    }

    public function test_a_valid_booking_request_is_stored(): void
    {
        Mail::fake();
        $this->seed(DatabaseSeeder::class);
        $tour = Tour::query()->where('slug', 'safari-blue')->firstOrFail();
        $tour->update(['price' => 75, 'currency' => 'USD']);

        $this->get("/book/{$tour->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Bookings/Create', false)
                ->where('tour.slug', 'safari-blue'));

        $response = $this->post('/bookings', [
            'tour_id' => $tour->id,
            'booking_type' => 'shared',
            'full_name' => 'Test Traveller',
            'email' => 'traveller@example.com',
            'whatsapp' => '+255 712 345 678',
            'preferred_contact' => 'whatsapp',
            'travel_date' => now()->addWeek()->toDateString(),
            'adults' => 2,
            'children' => 1,
            'children_ages' => [8],
            'pickup_zone' => 'stone_town',
            'hotel' => 'Stone Town Hotel',
            'special_requests' => 'Vegetarian lunch',
            'consent' => true,
            'website' => '',
        ]);

        $booking = $tour->bookings()->firstOrFail();

        $response->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'tour_id' => $tour->id,
            'full_name' => 'Test Traveller',
            'status' => 'confirmed',
            'estimated_price' => 195,
            'estimated_currency' => 'USD',
            'quoted_price' => null,
        ]);
        $this->get($response->headers->get('Location'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Bookings/Success', false)
                ->where('booking.reference', $booking->reference)
                ->where('booking.estimatedPrice', 195));
        $this->get(route('bookings.success', $booking))->assertForbidden();
        Mail::assertQueued(NewWebsiteSubmission::class, fn (NewWebsiteSubmission $mail) => $mail->reference === $booking->reference);
        Mail::assertQueued(BookingConfirmationMail::class, fn (BookingConfirmationMail $mail) => $mail->booking->is($booking));

        $voucherUrl = URL::temporarySignedRoute('bookings.voucher', now()->addHour(), ['booking' => $booking]);
        $this->get($voucherUrl)
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $admin = User::factory()->create(['is_admin' => true, 'is_active' => true]);
        $this->actingAs($admin)
            ->get('/admin/bookings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Bookings/Index', false)
                ->where('bookings.data.0.reference', $booking->reference));
    }

    public function test_invalid_booking_request_is_rejected(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->from('/book/safari-blue')
            ->post('/bookings', [])
            ->assertRedirect('/book/safari-blue')
            ->assertSessionHasErrors(['tour_id', 'full_name', 'whatsapp', 'travel_date']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_group_price_and_child_age_bands_are_calculated_correctly(): void
    {
        Mail::fake();
        $this->seed(DatabaseSeeder::class);
        $tour = Tour::query()->where('slug', 'safari-blue')->firstOrFail();

        $this->post('/bookings', [
            'tour_id' => $tour->id,
            'booking_type' => 'shared',
            'full_name' => 'Group Traveller',
            'email' => 'group@example.com',
            'whatsapp' => '+255 712 345 678',
            'preferred_contact' => 'whatsapp',
            'travel_date' => now()->addWeek()->toDateString(),
            'adults' => 5,
            'children' => 2,
            'children_ages' => [8, 2],
            'pickup_zone' => 'stone_town',
            'hotel' => 'Stone Town Hotel',
            'consent' => true,
            'website' => '',
        ])->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'tour_id' => $tour->id,
            'estimated_price' => 370,
            'estimated_currency' => 'USD',
        ]);
    }

    public function test_safari_booking_is_automatically_confirmed_with_a_fixed_total(): void
    {
        Mail::fake();
        $this->seed(DatabaseSeeder::class);
        $tour = Tour::query()->where('slug', 'mikumi-day-safari-from-zanzibar')->firstOrFail();

        $response = $this->post('/safari-requests', [
            'tour_slug' => $tour->slug,
            'name' => 'Safari Traveller',
            'preferred_contact' => 'email',
            'email' => 'safari@example.com',
            'whatsapp' => '+255775110089',
            'start_date' => now()->addMonth()->toDateString(),
            'days' => 1,
            'adults' => 2,
            'children' => 1,
            'parks' => ['Mikumi'],
            'accommodation' => 'Mid-range',
            'arrival_point' => 'Zanzibar',
            'notes' => 'Window seats if available.',
            'consent' => true,
            'website' => '',
        ]);

        $response->assertRedirect();
        $booking = Booking::query()->where('tour_id', $tour->id)->firstOrFail();
        $this->assertSame('confirmed', $booking->status);
        $this->assertSame('1350.00', $booking->estimated_price);
        $this->assertStringStartsWith('SAF-', $booking->reference);
        Mail::assertQueued(BookingConfirmationMail::class, fn (BookingConfirmationMail $mail) => $mail->booking->is($booking));
        $this->get($response->headers->get('Location'))->assertOk();
    }

    public function test_safari_group_rate_is_applied_for_six_or_more_paying_guests(): void
    {
        Mail::fake();
        $this->seed(DatabaseSeeder::class);
        $tour = Tour::query()->where('slug', 'mikumi-day-safari-from-zanzibar')->firstOrFail();

        $this->post('/safari-requests', [
            'tour_slug' => $tour->slug,
            'name' => 'Safari Group',
            'preferred_contact' => 'email',
            'email' => 'group@example.com',
            'whatsapp' => '+255775110089',
            'start_date' => now()->addMonth()->toDateString(),
            'days' => 1,
            'adults' => 6,
            'children' => 0,
            'parks' => ['Mikumi'],
            'accommodation' => 'Not sure',
            'arrival_point' => 'Zanzibar',
            'notes' => '',
            'consent' => true,
            'website' => '',
        ])->assertRedirect();

        $booking = Booking::query()->where('tour_id', $tour->id)->firstOrFail();
        $this->assertSame('2550.00', $booking->estimated_price);
        $this->assertSame('confirmed', $booking->status);
    }

    public function test_booking_honeypot_rejects_bot_submission(): void
    {
        $this->seed(DatabaseSeeder::class);
        $tour = Tour::query()->firstOrFail();

        $this->from("/book/{$tour->slug}")->post('/bookings', [
            'tour_id' => $tour->id,
            'full_name' => 'Bot Submission',
            'whatsapp' => '+255700000000',
            'travel_date' => now()->addDay()->toDateString(),
            'adults' => 1,
            'children' => 0,
            'consent' => true,
            'website' => 'https://spam.example',
        ])->assertSessionHasErrors('website');

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_admin_can_login_and_manage_booking_status(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'secret-password',
            'is_admin' => true,
        ]);
        $tour = Tour::query()->firstOrFail();
        $booking = $tour->bookings()->create([
            'reference' => 'MTS-TEST-001',
            'booking_type' => 'shared',
            'full_name' => 'Admin Test Guest',
            'whatsapp' => '+255700000000',
            'preferred_contact' => 'whatsapp',
            'travel_date' => now()->addDay(),
            'adults' => 2,
            'children' => 0,
            'children_ages' => [],
            'pickup_zone' => 'stone_town',
            'status' => 'pending',
            'source' => 'website',
        ]);

        $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'secret-password',
        ])->assertRedirect('/admin');

        $this->get('/admin')->assertOk();
        $this->patch("/admin/bookings/{$booking->reference}", [
            'status' => 'confirmed',
            'admin_notes' => 'Deposit confirmed by the team.',
        ])->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'reference' => $booking->reference,
            'status' => 'confirmed',
            'admin_notes' => 'Deposit confirmed by the team.',
        ]);
        $this->assertNotNull($booking->fresh()->confirmed_at);
        $this->get("/admin/bookings/{$booking->reference}")->assertOk();

        $this->delete("/admin/bookings/{$booking->reference}")->assertRedirect('/admin/bookings');
        $this->assertSoftDeleted('bookings', ['reference' => $booking->reference]);
        $this->patch("/admin/bookings/{$booking->reference}/restore")->assertRedirect();
        $this->assertDatabaseHas('bookings', [
            'reference' => $booking->reference,
            'deleted_at' => null,
        ]);
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_admin_can_update_a_tour_and_upload_cover_image(): void
    {
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);
        $admin = User::factory()->create(['is_admin' => true]);
        $tour = Tour::query()->where('slug', 'safari-blue')->firstOrFail();

        $response = $this->actingAs($admin)->post("/admin/tours/{$tour->slug}", [
            'tour_category_id' => $tour->tour_category_id,
            'experience_type' => $tour->experience_type,
            'title' => 'Safari Blue Premium',
            'slug' => $tour->slug,
            'excerpt' => $tour->excerpt,
            'description' => $tour->description,
            'duration' => $tour->duration,
            'location' => $tour->location,
            'price' => 95,
            'currency' => 'USD',
            'pickup_details' => $tour->pickup_details,
            'is_featured' => true,
            'is_popular' => true,
            'is_published' => true,
            'cover_image' => UploadedFile::fake()->image('safari-blue.jpg', 1200, 800),
        ]);

        $response->assertRedirect();
        $tour->refresh();

        $this->assertSame('Safari Blue Premium', $tour->title);
        $this->assertSame('95.00', $tour->price);
        $this->assertStringStartsWith('/storage/tours/', $tour->cover_image_path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $tour->cover_image_path));
    }

    public function test_admin_can_manage_tour_details_and_gallery(): void
    {
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);
        $admin = User::factory()->create(['is_admin' => true]);
        $tour = Tour::query()->where('slug', 'mnemba-island')->firstOrFail();

        $this->actingAs($admin)->post("/admin/tours/{$tour->slug}/content", [
            'highlights' => ['Private boat', 'Guided snorkeling'],
            'included' => ['Boat', 'Guide'],
            'not_included' => ['Tips'],
            'itinerary' => [
                ['time' => '08:00', 'title' => 'Pickup', 'description' => 'Hotel pickup'],
                ['time' => '10:00', 'title' => 'Snorkeling', 'description' => 'Guided reef session'],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('tour_highlights', ['tour_id' => $tour->id, 'label' => 'Private boat']);
        $this->assertDatabaseHas('tour_inclusions', ['tour_id' => $tour->id, 'label' => 'Tips', 'is_included' => false]);
        $this->assertDatabaseHas('tour_itinerary_items', ['tour_id' => $tour->id, 'title' => 'Snorkeling']);

        $this->actingAs($admin)->post("/admin/tours/{$tour->slug}/images", [
            'images' => [
                UploadedFile::fake()->image('reef-one.jpg', 1400, 900),
                UploadedFile::fake()->image('reef-two.png', 1000, 800),
            ],
        ])->assertRedirect();

        $this->assertDatabaseCount('tour_images', 2);
        $image = $tour->images()->firstOrFail();
        $storedPath = str_replace('/storage/', '', $image->path);
        $this->assertStringEndsWith('.webp', $storedPath);
        Storage::disk('public')->assertExists($storedPath);

        $this->actingAs($admin)->patch("/admin/tours/{$tour->slug}/images/{$image->id}", [
            'alt_text' => 'Mnemba coral reef',
            'sort_order' => 5,
        ])->assertRedirect();
        $this->assertDatabaseHas('tour_images', ['id' => $image->id, 'alt_text' => 'Mnemba coral reef', 'sort_order' => 5]);

        $this->actingAs($admin)->delete("/admin/tours/{$tour->slug}/images/{$image->id}")->assertRedirect();
        $this->assertDatabaseMissing('tour_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($storedPath);
    }

    public function test_admin_can_manage_cms_content(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get('/admin/cms/settings')->assertOk();
        $this->actingAs($admin)->patch('/admin/cms/settings', [
            'settings' => [
                'site_name' => 'Zola Tours & Safaris',
                'site_tagline' => 'Explore Zanzibar and Tanzania',
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('site_settings', ['key' => 'site_name', 'value' => 'Zola Tours & Safaris']);
        $this->assertSame('Zola Tours & Safaris', SiteSetting::publicValues()['site_name']);

        $this->actingAs($admin)->put('/admin/cms/home', [
            'sections' => [
                'trust' => [[
                    'title' => 'Local experts',
                    'description' => '',
                    'meta' => '',
                    'icon' => 'users',
                    'is_active' => true,
                ]],
                'why' => [],
                'testimonial' => [],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('home_content_items', ['section' => 'trust', 'title' => 'Local experts']);
        $this->actingAs($admin)->get('/admin/cms/home')->assertOk();
        $this->actingAs($admin)->get('/admin/cms/categories')->assertOk();
        $this->get('/')->assertOk();
    }

    public function test_contact_form_stores_an_inquiry_for_admin(): void
    {
        $response = $this->post('/contact', [
            'name' => 'Zanzibar Traveller',
            'email' => 'guest@example.com',
            'preferred_contact' => 'email',
            'topic' => 'tour',
            'subject' => 'Private island tour',
            'message' => 'Please help us plan a private tour for four guests.',
            'consent' => true,
            'website' => '',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contact_inquiries', [
            'email' => 'guest@example.com',
            'status' => 'new',
        ]);

        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->get('/admin/inquiries')->assertOk();
    }

    public function test_admin_can_create_and_manage_hero_slides(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->post('/admin/cms/hero-slides', [
            'eyebrow' => 'Ocean adventure',
            'title' => 'Explore Mnemba',
            'description' => 'A guided snorkeling experience.',
            'image_alt' => 'Clear water around Mnemba',
            'primary_label' => 'View tour',
            'primary_url' => '/tours/mnemba-island',
            'secondary_label' => 'Chat on WhatsApp',
            'secondary_url' => 'whatsapp',
            'sort_order' => 1,
            'is_active' => true,
            'image' => UploadedFile::fake()->image('mnemba.jpg', 1800, 1000),
        ])->assertRedirect();

        $slide = HeroSlide::query()->where('title', 'Explore Mnemba')->firstOrFail();
        $this->assertStringEndsWith('.webp', $slide->image_path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $slide->image_path));
        $this->actingAs($admin)->get('/admin/cms/hero-slides')->assertOk();
    }

    public function test_owner_can_create_and_update_team_users(): void
    {
        $owner = User::factory()->create([
            'is_admin' => true,
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        $this->actingAs($owner)->get('/admin/users')->assertOk();
        $this->actingAs($owner)->post('/admin/users', [
            'name' => 'Content Manager',
            'email' => 'content@example.com',
            'role' => 'editor',
            'password' => 'StrongPass123',
            'password_confirmation' => 'StrongPass123',
            'is_active' => true,
        ])->assertRedirect();

        $editor = User::query()->where('email', 'content@example.com')->firstOrFail();
        $this->assertTrue($editor->is_admin);
        $this->assertSame('editor', $editor->role);

        $this->actingAs($owner)->patch("/admin/users/{$editor->id}", [
            'name' => 'Content Manager',
            'email' => 'content@example.com',
            'role' => 'admin',
            'password' => '',
            'password_confirmation' => '',
            'is_active' => false,
        ])->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $editor->id, 'role' => 'admin', 'is_active' => false]);
    }

    public function test_user_management_security_guards_are_enforced(): void
    {
        $owner = User::factory()->create([
            'email' => 'owner@example.com',
            'password' => 'OwnerPassword123',
            'is_admin' => true,
            'role' => 'super_admin',
            'is_active' => true,
        ]);
        $editor = User::factory()->create([
            'is_admin' => true,
            'role' => 'editor',
            'is_active' => true,
        ]);
        $inactive = User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => 'InactivePassword123',
            'is_admin' => true,
            'role' => 'admin',
            'is_active' => false,
        ]);

        $this->actingAs($editor)->get('/admin/users')->assertForbidden();

        $this->actingAs($owner)->patch("/admin/users/{$owner->id}", [
            'name' => $owner->name,
            'email' => $owner->email,
            'role' => 'editor',
            'password' => '',
            'password_confirmation' => '',
            'is_active' => true,
        ])->assertSessionHasErrors('role');

        auth()->logout();
        $this->post('/admin/login', [
            'email' => $inactive->email,
            'password' => 'InactivePassword123',
        ])->assertSessionHasErrors('email');
    }

    public function test_admin_can_create_categories_and_new_tours(): void
    {
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->post('/admin/cms/categories', [
            'name' => 'Luxury Experiences',
            'slug' => 'luxury-experiences',
            'description' => 'Private and premium Zanzibar experiences.',
            'sort_order' => 20,
            'is_active' => true,
            'image' => UploadedFile::fake()->image('luxury.jpg', 1400, 900),
        ])->assertRedirect();

        $category = \App\Models\TourCategory::query()->where('slug', 'luxury-experiences')->firstOrFail();
        $this->assertStringStartsWith('/storage/categories/', $category->image_path);

        $response = $this->actingAs($admin)->post('/admin/tours', [
            'tour_category_id' => $category->id,
            'experience_type' => 'zanzibar_tour',
            'title' => 'Private Sunset Cruise',
            'slug' => 'private-sunset-cruise',
            'excerpt' => 'A private sunset cruise along the Zanzibar coast.',
            'description' => 'Enjoy a private sailing experience with local crew and refreshments.',
            'duration' => '3 Hours',
            'location' => 'Zanzibar Coast',
            'price' => 150,
            'currency' => 'USD',
            'minimum_age' => null,
            'difficulty' => null,
            'pickup_details' => 'Pickup is confirmed after booking.',
            'meta_title' => 'Private Sunset Cruise Zanzibar',
            'meta_description' => 'Book a private sunset cruise in Zanzibar.',
            'is_featured' => false,
            'is_popular' => false,
            'is_published' => false,
            'cover_image' => UploadedFile::fake()->image('sunset.jpg', 1800, 1100),
        ]);

        $tour = Tour::query()->where('slug', 'private-sunset-cruise')->firstOrFail();
        $response->assertRedirect(route('admin.tours.edit', $tour));
        $this->assertFalse($tour->is_published);
        $this->assertStringStartsWith('/storage/tours/', $tour->cover_image_path);
        $this->actingAs($admin)->get('/admin/tours/create')->assertOk();
    }
    public function test_admin_can_manage_travel_guides(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);
        $this->actingAs($admin)->get('/admin/guides')->assertOk();
        $this->actingAs($admin)->post('/admin/guides', [
            'title' => 'Local Zanzibar Planning Tips', 'slug' => 'local-zanzibar-planning-tips',
            'category' => 'Planning', 'excerpt' => 'Useful local advice for a smooth Zanzibar holiday.',
            'content' => 'Plan your dates first.\n\nThen confirm tours and transport with the local team.',
            'reading_time' => 4, 'image' => UploadedFile::fake()->image('guide.jpg', 1600, 900),
            'is_featured' => true, 'is_published' => true,
            'meta_title' => 'Local Zanzibar Planning Tips', 'meta_description' => 'Useful Zanzibar planning advice.',
        ])->assertRedirect();
        $guide = TravelGuide::query()->where('slug', 'local-zanzibar-planning-tips')->firstOrFail();
        $this->assertTrue($guide->is_published);
        $this->assertStringStartsWith('/storage/guides/', $guide->image_path);
        $this->get('/guides/local-zanzibar-planning-tips')->assertOk();
    }

}
