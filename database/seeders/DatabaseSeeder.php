<?php

namespace Database\Seeders;

use App\Models\Tour;
use App\Models\TourCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Ocean & Islands', 'slug' => 'ocean-islands', 'description' => 'Boat trips, sandbanks and snorkelling around Zanzibar.', 'image_path' => '/images/experiences/safari-blue.webp'],
            ['name' => 'Culture & Heritage', 'slug' => 'culture-heritage', 'description' => 'Stories, flavours and historic places across the island.', 'image_path' => '/images/experiences/prison-island.webp'],
            ['name' => 'Nature & Wildlife', 'slug' => 'nature-wildlife', 'description' => 'Forests, wildlife and the natural side of Zanzibar.', 'image_path' => '/images/experiences/jozani-forest.webp'],
            ['name' => 'Tanzania Safaris', 'slug' => 'tanzania-safaris', 'description' => 'Private safari journeys from Zanzibar and mainland Tanzania.', 'image_path' => '/images/experiences/tanzania-safaris.webp'],
        ])->mapWithKeys(function (array $data, int $index): array {
            $category = TourCategory::query()->updateOrCreate(['slug' => $data['slug']], $data + ['sort_order' => $index + 1, 'is_active' => true]);
            return [$data['slug'] => $category];
        });

        $tours = [
            ['ocean-islands','safari-blue','Safari Blue Zanzibar','A full-day dhow adventure with snorkelling, a sandbank stop and a relaxed seafood lunch.','Full Day','Fumba, Zanzibar',75,65,45,'/images/experiences/safari-blue.webp'],
            ['ocean-islands','mnemba-island','Mnemba Island Snorkelling','Explore clear turquoise water and colourful reefs around the beautiful Mnemba atoll.','Half Day','North-East Zanzibar',65,55,40,'/images/experiences/mnemba-island.webp'],
            ['culture-heritage','prison-island','Prison Island & Giant Tortoises','Take a short boat trip from Stone Town to meet giant tortoises and discover the island history.','Half Day','Stone Town',45,38,30,'/images/experiences/prison-island.webp'],
            ['ocean-islands','nakupenda-sandbank','Nakupenda Sandbank','Swim, relax and enjoy a fresh island lunch on a white sandbank surrounded by the Indian Ocean.','Half Day','Stone Town Coast',55,48,35,'/images/experiences/kendwa-beach.webp'],
            ['culture-heritage','stone-town-tour','Stone Town Walking Tour','Walk through winding streets, historic buildings and lively markets with a local guide.','3 Hours','Stone Town',30,25,20,'/images/experiences/hero-zanzibar.webp'],
            ['culture-heritage','spice-tour','Zanzibar Spice Tour','See, smell and taste the spices that shaped Zanzibar’s history and culture.','Half Day','Central Zanzibar',35,30,20,'/images/experiences/spice-tour.webp'],
            ['nature-wildlife','jozani-forest','Jozani Forest Tour','Walk beneath the forest canopy and look for Zanzibar’s rare red colobus monkeys.','Half Day','Jozani',40,35,25,'/images/experiences/jozani-forest.webp'],
            ['ocean-islands','sunset-dhow-cruise','Sunset Dhow Cruise','Sail along the Zanzibar coast on a traditional dhow as the sun sets over the ocean.','2 Hours','Zanzibar Coast',40,35,25,'/images/experiences/hero-zanzibar-dhow.webp'],
        ];

        $tourDetails = [
            'safari-blue' => [
                'description' => 'Sail from the Fumba area on a traditional dhow and explore the beautiful Menai Bay coastline. The day combines snorkelling, time on the water and a relaxing sandbank or island stop. The route may change slightly depending on sea and weather conditions.',
                'pickup_details' => 'Meeting or pickup time is confirmed after booking based on your hotel location. The boat departs from the Fumba area.',
                'highlights' => ['Traditional dhow sailing', 'Snorkelling in Menai Bay', 'Sandbank or island stop', 'Relaxed full-day ocean experience'],
                'included' => ['Local guide and boat crew', 'Snorkelling equipment', 'Lunch and refreshments in the confirmed itinerary'],
                'excluded' => ['Hotel transfer unless confirmed', 'Personal expenses'],
                'itinerary' => [
                    ['Morning', 'Meet & depart', 'Meet the team, receive a short briefing and begin the dhow trip from Fumba.'],
                    ['Midday', 'Snorkel & explore', 'Enjoy snorkelling and a sandbank or island stop selected for the day’s conditions.'],
                    ['Afternoon', 'Lunch & return', 'Relax over lunch before sailing back to the departure point.'],
                ],
                'faqs' => [
                    ['Do I need to be a strong swimmer?', 'No. Please tell the crew your swimming level so they can assist you and provide the right safety guidance.'],
                    ['What happens if the weather changes?', 'Safety comes first. The route may be adjusted, postponed or rescheduled when sea conditions are unsuitable.'],
                ],
            ],
            'mnemba-island' => [
                'description' => 'Take a boat trip to the waters around Mnemba Atoll for a simple and scenic snorkelling experience. Explore clear water and reef areas with a local crew. Marine-life sightings vary naturally and cannot be guaranteed.',
                'pickup_details' => 'The meeting point and departure time on Zanzibar’s north-east coast are confirmed after booking. Hotel transfer can be arranged on request.',
                'highlights' => ['Snorkelling near Mnemba Atoll', 'Clear Indian Ocean water', 'Local boat crew and guidance'],
                'included' => ['Boat trip and local crew', 'Snorkelling equipment', 'Drinking water'],
                'excluded' => ['Hotel transfer unless confirmed', 'Personal expenses'],
                'itinerary' => [
                    ['Morning', 'Meet & boat briefing', 'Meet the crew at the confirmed beach departure point and receive a safety briefing.'],
                    ['Mid-morning', 'Mnemba snorkelling', 'Visit suitable reef areas and snorkel at a comfortable pace.'],
                    ['Early afternoon', 'Return to shore', 'Relax on the return boat ride to the departure beach.'],
                ],
                'faqs' => [
                    ['Are dolphins guaranteed?', 'No. Dolphins and other marine animals are wild, so sightings cannot be guaranteed.'],
                    ['Is the tour suitable for beginners?', 'Yes. Let the crew know your experience level before entering the water so they can guide you safely.'],
                ],
            ],
            'prison-island' => [
                'description' => 'Travel by boat from Stone Town to Changuu, commonly known as Prison Island. Meet the giant tortoises, hear the island’s history and enjoy the coastal scenery. Swimming time may be possible when conditions and the confirmed schedule allow.',
                'pickup_details' => 'Meet in Stone Town at the confirmed location. Hotel transfer can be arranged separately on request.',
                'highlights' => ['Giant tortoise sanctuary', 'Changuu Island history', 'Short scenic boat ride from Stone Town'],
                'included' => ['Return boat trip', 'Local guide', 'Island entrance fee'],
                'excluded' => ['Hotel transfer unless confirmed', 'Food and personal expenses'],
                'itinerary' => [
                    ['Morning', 'Boat from Stone Town', 'Meet your guide and take a short boat ride across to Changuu Island.'],
                    ['Late morning', 'Explore the island', 'Visit the tortoise sanctuary and learn about the island’s history.'],
                    ['Early afternoon', 'Return to Stone Town', 'Enjoy the coastal view before returning to the meeting point.'],
                ],
                'faqs' => [
                    ['How long is the boat ride?', 'The crossing is usually short, but the exact time depends on the boat and sea conditions.'],
                    ['Can I swim during the tour?', 'Swimming may be possible when conditions and the confirmed itinerary allow. Bring swimwear if you would like the option.'],
                ],
            ],
        ];

        foreach ($tours as $index => [$category, $slug, $title, $excerpt, $duration, $location, $price, $groupPrice, $childPrice, $image]) {
            $details = $tourDetails[$slug] ?? null;
            $tour = Tour::query()->updateOrCreate(['slug' => $slug], [
                'tour_category_id' => $categories[$category]->id,
                'experience_type' => 'zanzibar_tour',
                'title' => $title,
                'excerpt' => $excerpt,
                'description' => $details['description'] ?? $excerpt.' Our local team will confirm the pickup time, availability and final arrangements before your tour.',
                'duration' => $duration,
                'location' => $location,
                'price' => $price,
                'shared_available' => true,
                'shared_adult_price' => $price,
                'shared_group_adult_price' => $groupPrice,
                'shared_child_price' => $childPrice,
                'shared_infant_price' => 0,
                'private_available' => false,
                'large_group_quote' => false,
                'currency' => 'USD',
                'cover_image_path' => $image,
                'pickup_details' => $details['pickup_details'] ?? 'Pickup details depend on your hotel location and will be confirmed after booking.',
                'minimum_age' => 0,
                'difficulty' => 'Easy',
                'is_featured' => $index < 3,
                'is_popular' => $index < 6,
                'is_published' => true,
                'sort_order' => $index + 1,
                'meta_title' => $title.' | Zola Tours & Safaris',
                'meta_description' => $excerpt,
            ]);

            $tour->highlights()->delete();
            foreach ($details['highlights'] ?? ['Local guide and clear planning', 'Memorable Zanzibar experience', 'Direct WhatsApp support'] as $order => $label) $tour->highlights()->create(['label' => $label, 'sort_order' => $order + 1]);
            $tour->inclusions()->delete();
            $inclusions = $details
                ? collect($details['included'])->map(fn (string $label): array => [$label, true])
                    ->concat(collect($details['excluded'])->map(fn (string $label): array => [$label, false]))
                : collect([['Local guide', true], ['Entry fees listed in the confirmed itinerary', true], ['Hotel transfer unless confirmed', false]]);
            foreach ($inclusions as $order => [$label, $included]) $tour->inclusions()->create(['label' => $label, 'is_included' => $included, 'sort_order' => $order + 1]);

            $tour->itineraryItems()->delete();
            foreach ($details['itinerary'] ?? [] as $order => [$time, $itemTitle, $description]) {
                $tour->itineraryItems()->create(['time_label' => $time, 'title' => $itemTitle, 'description' => $description, 'sort_order' => $order + 1]);
            }

            $tour->faqs()->delete();
            foreach ($details['faqs'] ?? [] as $order => [$question, $answer]) {
                $tour->faqs()->create(['question' => $question, 'answer' => $answer, 'sort_order' => $order + 1]);
            }
        }

        $safaris = [
            [
                'slug' => 'mikumi-day-safari-from-zanzibar',
                'title' => 'Mikumi Day Safari',
                'excerpt' => 'A full-day guided Mikumi game drive with clear ground-safari inclusions and optional Zanzibar flight arrangements.',
                'description' => 'Discover Mikumi National Park on a full-day ground safari with a professional guide. Your fixed package covers the park experience shown below. Return flights from Zanzibar and Zanzibar-side transfers are not included and can be quoted separately because airline schedules and fares change.',
                'duration' => '1 Day',
                'location' => 'Mikumi National Park',
                'image' => '/images/experiences/safari-mikumi-cover-v2.webp',
                'gallery' => [
                    ['/images/experiences/safari-mikumi-day.webp', 'Elephants in Mikumi National Park'],
                    ['/images/experiences/safari-mikumi-2-day.webp', 'Wildlife landscape in Mikumi National Park'],
                ],
                'price' => 500,
                'group_price' => 425,
                'highlights' => ['Full-day Mikumi game drive', 'Professional safari guide', 'Clear fixed ground-safari price'],
                'itinerary' => [['Morning', 'Meet the safari team', 'Meet at the confirmed Mikumi arrival point and receive a short safari briefing.'], ['Daytime', 'Mikumi game drive', 'Explore the park with a professional guide and enjoy the included lunch.'], ['Late afternoon', 'Finish the safari', 'Return to the confirmed Mikumi departure point for your onward travel.']],
                'included' => ['Mikumi arrival-point transfers', 'Professional safari guide', 'Park entry fees', 'Full-day game drive', 'Lunch and drinking water'],
                'not_included' => ['Return flights from Zanzibar', 'Zanzibar hotel and airport transfers', 'Accommodation', 'Travel insurance', 'Tips and personal expenses'],
                'pickup' => 'Meet at the confirmed Mikumi airstrip or mainland arrival point. Zanzibar flights and Zanzibar-side transfers can be quoted separately on request.',
            ],
            [
                'slug' => 'nyerere-two-day-safari',
                'title' => '2-Day Nyerere Safari',
                'excerpt' => 'A two-day road safari from Dar es Salaam with a boat safari, game drive and one night at a standard lodge.',
                'description' => 'Discover Nyerere National Park on a clear, fixed-price ground package from Dar es Salaam. Enjoy a Rufiji River boat safari, a full game drive and one night at a standard lodge or camp. Flights and Zanzibar-side transfers remain optional so the confirmed voucher has no uncertain transport charges.',
                'duration' => '2 Days',
                'location' => 'Nyerere National Park',
                'image' => '/images/experiences/safari-nyerere-cover-v2.webp',
                'gallery' => [
                    ['/images/experiences/safari-nyerere.webp', 'Wildlife experience in Nyerere National Park'],
                    ['/images/experiences/hero-safari.webp', 'Tanzania safari game drive landscape'],
                ],
                'price' => 600,
                'group_price' => 510,
                'highlights' => ['Rufiji River boat safari', 'Full Nyerere game drive', 'One night at a standard lodge or camp'],
                'itinerary' => [['Day 1', 'Dar es Salaam to Nyerere', 'Morning pickup in central Dar es Salaam, road transfer to Nyerere, lunch and an afternoon boat safari on the Rufiji River.'], ['Day 2', 'Game drive & return', 'After breakfast, enjoy a guided Nyerere game drive with lunch before returning to central Dar es Salaam.']],
                'included' => ['Return road transport from central Dar es Salaam', 'Professional English-speaking safari guide', 'Park and conservation fees', 'Rufiji River boat safari', 'One-night standard lodge or camp accommodation', 'Meals stated in the itinerary', 'Drinking water during the safari'],
                'not_included' => ['Flights to or from Zanzibar', 'Zanzibar hotel and airport transfers', 'Premium accommodation upgrades', 'Travel insurance', 'Alcoholic drinks', 'Tips and personal expenses'],
                'pickup' => 'Pickup and drop-off are included from a confirmed central Dar es Salaam hotel. Zanzibar flights and Zanzibar-side transfers can be quoted separately on request.',
            ],
            [
                'slug' => 'northern-circuit-safari',
                'title' => '3-Day Northern Circuit Safari',
                'excerpt' => 'A private three-day safari from Arusha through Tarangire, Ngorongoro Crater and Lake Manyara.',
                'description' => 'Explore three northern Tanzania highlights on a clear, fixed-price private safari from Arusha. Visit Tarangire National Park, descend into Ngorongoro Crater and finish with Lake Manyara, with a private 4x4, a professional guide and two nights of standard lodge or tented-camp accommodation.',
                'duration' => '3 Days / 2 Nights',
                'location' => 'Northern Tanzania',
                'image' => '/images/experiences/safari-northern-cover-v2.webp',
                'gallery' => [
                    ['/images/experiences/safari-tarangire.webp', 'Elephants and baobabs in Tarangire National Park'],
                    ['/images/experiences/safari-ngorongoro.webp', 'Panoramic view across Ngorongoro landscape'],
                ],
                'price' => 1500,
                'group_price' => 1275,
                'highlights' => ['Tarangire elephant country', 'Ngorongoro Crater descent', 'Lake Manyara game drive'],
                'itinerary' => [['Day 1', 'Arusha to Tarangire', 'Morning pickup in Arusha, a full Tarangire game drive with picnic lunch, then transfer to your standard lodge or tented camp.'], ['Day 2', 'Ngorongoro Crater', 'After breakfast, descend into Ngorongoro Crater for a guided game drive and picnic lunch before the second overnight stay.'], ['Day 3', 'Lake Manyara & Arusha', 'Enjoy a Lake Manyara game drive with lunch, then return to your confirmed hotel or airport drop-off in Arusha.']],
                'included' => ['Private 4x4 safari vehicle with pop-up roof', 'Professional English-speaking driver-guide', 'All park, conservation and crater fees', 'Two nights standard lodge or tented-camp accommodation', 'Meals stated in the itinerary', 'Drinking water during the safari', 'Arusha hotel or airport pickup and drop-off'],
                'not_included' => ['Flights to or from Arusha', 'Zanzibar hotel and airport transfers', 'Premium accommodation upgrades', 'Visa and travel insurance', 'Alcoholic drinks', 'Tips and personal expenses'],
                'pickup' => 'Pickup and drop-off are included from a confirmed Arusha hotel or Arusha airport. Zanzibar and other domestic flights can be quoted separately on request.',
            ],
            [
                'slug' => 'tarangire-day-safari',
                'title' => 'Tarangire Day Safari',
                'excerpt' => 'A fixed-price day safari from Arusha among Tarangire’s elephants, ancient baobabs and open savannah.',
                'description' => 'Travel from Arusha to Tarangire National Park for a full guided game drive in a safari 4x4. The fixed package includes return transport, park fees, a professional guide, picnic lunch and drinking water, making it a simple choice for travellers with one free day in northern Tanzania.',
                'duration' => '1 Day',
                'location' => 'Tarangire National Park',
                'image' => '/images/experiences/safari-tarangire.webp',
                'gallery' => [
                    ['/images/experiences/safari-northern-cover-v2.webp', 'Northern Tanzania safari landscape'],
                    ['/images/experiences/hero-safari.webp', 'Guided Tanzania wildlife safari'],
                ],
                'price' => 350,
                'group_price' => 300,
                'highlights' => ['Large elephant herds', 'Ancient baobab landscapes', 'Full-day guided game drive from Arusha'],
                'itinerary' => [['Early morning', 'Depart from Arusha', 'Meet your guide and drive to Tarangire National Park.'], ['Daytime', 'Tarangire game drive', 'Explore river, woodland and savannah habitats with a picnic lunch.'], ['Evening', 'Return to Arusha', 'Leave the park and return to your confirmed Arusha drop-off point.']],
                'included' => ['Return safari 4x4 transport from Arusha', 'Professional English-speaking driver-guide', 'Tarangire park and conservation fees', 'Full-day guided game drive', 'Picnic lunch and drinking water', 'Arusha hotel pickup and drop-off'],
                'not_included' => ['Flights to or from Arusha', 'Accommodation before or after the safari', 'Pickup outside the Arusha area', 'Visa and travel insurance', 'Alcoholic drinks', 'Tips and personal expenses'],
                'pickup' => 'Pickup and drop-off are included from a confirmed Arusha hotel. Airport pickup or locations outside Arusha can be quoted separately on request.',
            ],
            [
                'slug' => 'ngorongoro-crater-day-safari',
                'title' => 'Ngorongoro Crater Day Safari',
                'excerpt' => 'A fixed-price day safari from Arusha with a guided game drive on the world-famous Ngorongoro Crater floor.',
                'description' => 'Travel from Arusha to the Ngorongoro Conservation Area and descend to the crater floor for a guided wildlife safari. The fixed package includes return 4x4 transport, conservation and crater service fees, a professional guide, picnic lunch and drinking water.',
                'duration' => '1 Day',
                'location' => 'Ngorongoro Conservation Area',
                'image' => '/images/experiences/safari-ngorongoro.webp',
                'gallery' => [
                    ['/images/experiences/safari-northern-cover-v2.webp', 'Northern Tanzania safari scenery'],
                    ['/images/experiences/hero-safari.webp', 'Wildlife game drive in Tanzania'],
                ],
                'price' => 550,
                'group_price' => 470,
                'highlights' => ['Ngorongoro Crater descent', 'Crater-floor wildlife game drive', 'Scenic highland and crater landscapes'],
                'itinerary' => [['Early morning', 'Arusha to Ngorongoro', 'Early pickup from your Arusha hotel and drive through the highlands to the Ngorongoro Conservation Area.'], ['Daytime', 'Crater floor game drive', 'Descend into the crater for guided wildlife viewing and a picnic lunch at an approved site.'], ['Evening', 'Return to Arusha', 'Ascend from the crater and return to your confirmed Arusha hotel.']],
                'included' => ['Return safari 4x4 transport from Arusha', 'Professional English-speaking driver-guide', 'Ngorongoro conservation entry fee', 'Crater service and vehicle fees', 'Guided crater-floor game drive', 'Picnic lunch and drinking water', 'Arusha hotel pickup and drop-off'],
                'not_included' => ['Flights to or from Arusha', 'Accommodation before or after the safari', 'Pickup outside the Arusha area', 'Visa and travel insurance', 'Alcoholic drinks', 'Tips and personal expenses'],
                'pickup' => 'Pickup and drop-off are included from a confirmed Arusha hotel. Airport pickup or locations outside Arusha can be quoted separately on request.',
            ],
            [
                'slug' => 'serengeti-ngorongoro-four-day-safari',
                'title' => '4-Day Serengeti & Ngorongoro Safari',
                'excerpt' => 'A fixed-price private road safari from Arusha with two days in Serengeti and a Ngorongoro Crater game drive.',
                'description' => 'Spend four days exploring Serengeti National Park and Ngorongoro Crater on a clear private road-safari package from Arusha. The journey includes a safari 4x4, a professional guide, three nights of mid-range lodge or tented-camp accommodation, park fees, meals and drinking water.',
                'duration' => '4 Days / 3 Nights',
                'location' => 'Serengeti & Ngorongoro',
                'image' => '/images/experiences/safari-northern-cover-v2.webp',
                'gallery' => [
                    ['/images/experiences/safari-tarangire.webp', 'Elephants and baobabs in Tarangire'],
                    ['/images/experiences/safari-ngorongoro.webp', 'Ngorongoro safari landscape'],
                    ['/images/experiences/hero-safari.webp', 'Classic Tanzania safari game drive'],
                ],
                'price' => 1950,
                'group_price' => 1650,
                'highlights' => ['Two days of Serengeti wildlife viewing', 'Ngorongoro Crater descent', 'Three nights mid-range safari accommodation'],
                'itinerary' => [['Day 1', 'Arusha to Central Serengeti', 'Early pickup in Arusha, drive through the Ngorongoro highlands and enter Serengeti for an afternoon game drive.'], ['Day 2', 'Full day in Serengeti', 'Explore Central Serengeti on morning and afternoon game drives with meals and an overnight stay in the park area.'], ['Day 3', 'Serengeti to Ngorongoro', 'Enjoy a final Serengeti game drive, then travel toward the Ngorongoro highlands for the third overnight stay.'], ['Day 4', 'Ngorongoro Crater & Arusha', 'Descend to the crater floor for a guided game drive and picnic lunch, then return to Arusha.']],
                'included' => ['Private safari 4x4 with pop-up roof', 'Professional English-speaking driver-guide', 'Serengeti and Ngorongoro park and conservation fees', 'Ngorongoro crater service fee', 'Three nights mid-range lodge or tented-camp accommodation', 'Meals stated in the itinerary', 'Drinking water during the safari', 'Arusha hotel or airport pickup and drop-off'],
                'not_included' => ['International and domestic flights', 'Zanzibar hotel and airport transfers', 'Premium accommodation upgrades', 'Visa and travel insurance', 'Alcoholic drinks', 'Optional balloon safari', 'Tips and personal expenses'],
                'pickup' => 'Pickup and drop-off are included from a confirmed Arusha hotel or Arusha airport. Zanzibar and other domestic flights can be quoted separately on request.',
            ],
        ];

        foreach ($safaris as $index => $data) {
            $safari = Tour::query()->updateOrCreate(['slug' => $data['slug']], [
                'tour_category_id' => $categories['tanzania-safaris']->id,
                'experience_type' => 'safari',
                'title' => $data['title'],
                'excerpt' => $data['excerpt'],
                'description' => $data['description'],
                'duration' => $data['duration'],
                'location' => $data['location'],
                'price' => $data['price'],
                'shared_available' => true,
                'shared_adult_price' => $data['price'],
                'shared_group_adult_price' => $data['group_price'],
                'shared_child_price' => round($data['price'] * 0.7, 2),
                'shared_infant_price' => null,
                'private_available' => false,
                'large_group_quote' => false,
                'currency' => 'USD',
                'cover_image_path' => $data['image'],
                'pickup_details' => $data['pickup'],
                'minimum_age' => 0,
                'difficulty' => 'Easy to Moderate',
                'is_featured' => true,
                'is_popular' => true,
                'is_published' => true,
                'sort_order' => $index + 1,
                'meta_title' => $data['title'].' | Zola Tours & Safaris',
                'meta_description' => $data['excerpt'],
            ]);

            $safari->highlights()->delete();
            foreach ($data['highlights'] as $order => $label) $safari->highlights()->create(['label' => $label, 'sort_order' => $order + 1]);

            $safari->inclusions()->delete();
            $inclusions = collect($data['included'])->map(fn ($label) => [$label, true])
                ->concat(collect($data['not_included'])->map(fn ($label) => [$label, false]));
            foreach ($inclusions as $order => [$label, $included]) {
                $safari->inclusions()->create(['label' => $label, 'is_included' => $included, 'sort_order' => $order + 1]);
            }

            $safari->itineraryItems()->delete();
            foreach ($data['itinerary'] as $order => [$time, $itemTitle, $description]) {
                $safari->itineraryItems()->create(['time_label' => $time, 'title' => $itemTitle, 'description' => $description, 'sort_order' => $order + 1]);
            }

            foreach ($data['gallery'] as $order => [$path, $alt]) {
                $safari->images()->updateOrCreate(['path' => $path], ['alt_text' => $alt, 'sort_order' => $order + 1]);
            }

            $safari->faqs()->delete();
            foreach ([
                ['Is the displayed price final?', 'The displayed total is the fixed price for the listed inclusions and selected guests. Optional flights, accommodation or extra transfers are quoted separately.'],
                ['Can the itinerary be changed?', 'Yes. The safari is planned around your available time, preferred parks and travel style.'],
            ] as $order => [$question, $answer]) {
                $safari->faqs()->create(['question' => $question, 'answer' => $answer, 'sort_order' => $order + 1]);
            }
        }

        foreach ([
            ['Airport / Seaport', 'Stone Town', 20, 30, 45, 70],
            ['Airport / Seaport', 'Nungwi / Kendwa', 45, 55, 80, 130],
            ['Airport / Seaport', 'Kiwengwa / Pwani Mchangani / Matemwe', 45, 55, 80, 130],
            ['Airport / Seaport', 'Paje / Jambiani / Bwejuu', 50, 60, 90, 140],
            ['Airport / Seaport', 'Kizimkazi / Makunduchi', 60, 70, 100, 160],
            ['Stone Town', 'Nungwi / Kendwa', 45, 55, 80, 130],
            ['Stone Town', 'Kiwengwa / Pwani Mchangani / Matemwe', 45, 55, 80, 130],
            ['Stone Town', 'Paje / Jambiani / Bwejuu', 50, 60, 90, 140],
            ['Nungwi / Kendwa', 'Paje / Jambiani / Bwejuu', 75, 90, 130, 210],
        ] as $index => [$pickup, $destination, $sedan, $minivan, $van, $minibus]) {
            \App\Models\TransportRoute::query()->updateOrCreate(
                ['pickup_location' => $pickup, 'destination' => $destination],
                [
                    'currency' => 'USD',
                    'sedan_price' => $sedan,
                    'suv_minivan_price' => $minivan,
                    'van_price' => $van,
                    'minibus_price' => $minibus,
                    'return_discount_percent' => 10,
                    'night_surcharge' => 10,
                    'night_start' => '22:00',
                    'night_end' => '06:00',
                    'child_seat_fee' => 5,
                    'is_bidirectional' => true,
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ],
            );
        }

        $settings = [
            ['general','site_name','Website name','text','Zola Tours & Safaris'],
            ['general','site_tagline','Tagline','text','Explore. Experience. Remember.'],
            ['contact','phone','Phone number','tel','+255 775 110 089'],
            ['contact','whatsapp_number','WhatsApp number','text','255775110089'],
            ['contact','location','Business location','text','Zanzibar, Tanzania'],
            ['contact','working_hours','Working hours','text','Daily 08:00–20:00 EAT'],
            ['contact','email','Email address','email','info@zolatoursandsafaris.com'],
            ['media','logo_path','Website logo','image','/brand/zola-tours-logo.jpeg'],
            ['media','cta_image_path','CTA image','image','/images/experiences/cta-zanzibar.webp'],
            ['pages','about_image_path','About image','image','/images/experiences/cta-zanzibar.webp'],
        ];
        foreach ($settings as $index => [$group,$key,$label,$type,$value]) \App\Models\SiteSetting::query()->updateOrCreate(['key' => $key], compact('group','label','type','value') + ['sort_order' => $index]);

        \App\Models\HeroSlide::query()->update(['is_active' => false]);
        foreach ([
            ['Nungwi · Zanzibar','Beautiful Zanzibar','White sand, turquoise water and unforgettable island moments.','/images/experiences/zola-hero-beach-v2.webp','White sand, turquoise water and a traditional dhow in Zanzibar','center','Explore Zanzibar','/tours'],
            ['Tanzania Safari','Wild Tanzania','Meet Tanzania’s wildlife on a safari made simple.','/images/experiences/zola-hero-safari-v2.webp','Elephant family crossing the Tanzania savannah','center','Explore Safaris','/safaris'],
            ['Culture & Heritage','Real Zanzibar','Discover Stone Town, island spices and local stories.','/images/experiences/zola-hero-culture-v2.webp','Historic Stone Town alley with a traditional carved Zanzibar door','center','Explore Culture','/tours?category=culture-heritage'],
            ['Jozani Forest','Wild Jozani','Meet Zanzibar’s rare red colobus monkeys.','/images/experiences/zola-hero-jozani-v2.webp','Zanzibar red colobus monkey in the green Jozani Forest','center','Explore Jozani','/tours/jozani-forest'],
            ['Zanzibar Spices','Taste Zanzibar','See, smell and discover the island’s famous spices.','/images/experiences/zola-hero-spice-v2.webp','Fresh cloves, cinnamon and cardamom at a Zanzibar spice farm','center','Explore Spice Tour','/tours/spice-tour'],
        ] as $index => [$eyebrow,$title,$description,$image_path,$image_alt,$image_position,$primary_label,$primary_url]) {
            \App\Models\HeroSlide::query()->updateOrCreate(['title' => $title], compact('eyebrow','description','image_path','image_alt','image_position','primary_label','primary_url') + ['secondary_label' => null, 'secondary_url' => null, 'sort_order' => $index + 1, 'is_active' => true]);
        }

        foreach ([
            ['why','Local Zanzibar knowledge','Guidance from a team that knows the island.','map','map-pin'],
            ['why','Simple planning','Clear details and direct communication.','simple','sparkles'],
            ['why','Personal support','Help before and during your experience.','support','message'],
        ] as $index => [$section,$title,$description,$meta,$icon]) \App\Models\HomeContentItem::query()->updateOrCreate(['section' => $section, 'title' => $title], compact('section','title','description','meta','icon') + ['sort_order' => $index + 1, 'is_active' => true]);

        if (env('ADMIN_EMAIL') && env('ADMIN_PASSWORD')) {
            User::query()->updateOrCreate(['email' => env('ADMIN_EMAIL')], ['name' => env('ADMIN_NAME') ?: 'Zola Tours Administrator', 'password' => Hash::make(env('ADMIN_PASSWORD')), 'is_admin' => true, 'role' => 'super_admin', 'is_active' => true]);
        }
    }
}
