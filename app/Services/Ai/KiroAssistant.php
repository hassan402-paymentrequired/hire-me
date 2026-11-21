<?php

namespace App\Services\Ai;

use App\Models\BusinessProfile;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use App\Models\WorkHour;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Kiro, Proxideck's chat assistant. Answers from real marketplace data: on the homepage it
 * helps clients find artisans, on a provider page it answers about that one business.
 */
class KiroAssistant
{
    /** How many past messages are sent to the model. */
    private const HISTORY_LIMIT = 10;

    /** How many providers are given to the model as search results. */
    private const SEARCH_LIMIT = 6;

    /** Words ignored when searching providers from a client's message. */
    private const STOP_WORDS = [
        'the', 'and', 'for', 'you', 'are', 'can', 'any', 'who', 'what', 'where', 'when', 'how', 'show',
        'find', 'need', 'want', 'looking', 'someone', 'near', 'nearby', 'around', 'good', 'best', 'top',
        'rated', 'cheap', 'with', 'that', 'this', 'there', 'please', 'help', 'get', 'me', 'my', 'some',
        'under', 'over', 'from', 'about', 'have', 'has', 'does', 'artisan', 'artisans', 'service',
        'services', 'book', 'booking', 'hire', 'new', 'one', 'today', 'tomorrow', 'price', 'prices',
    ];

    public function __construct(private NvidiaClient $nvidia) {}

    /**
     * @param  list<array{role: string, content: string}>  $history  conversation so far, ending with the client's message
     * @return array{reply: string, providers: list<array{businessName: string, slug: string, city: string, rating: float, reviewsCount: int, minPrice: float|null}>}
     *
     * @throws AiUnavailable
     */
    public function reply(array $history, ?BusinessProfile $business = null): array
    {
        $history = array_slice($history, -self::HISTORY_LIMIT);
        $question = (string) end($history)['content'];

        $providers = $business ? collect() : $this->searchProviders($question);

        $system = $business
            ? $this->businessPrompt($business)
            : $this->marketplacePrompt($providers);

        $reply = $this->nvidia->chat([
            ['role' => 'system', 'content' => $system],
            ...array_map(fn (array $m): array => ['role' => $m['role'], 'content' => $m['content']], $history),
        ]);

        return [
            'reply' => $reply,
            'providers' => $this->mentionedProviders($providers, $reply),
        ];
    }

    /**
     * Verified providers matching the client's words, best rated first. Falls back to the top rated.
     *
     * @return Collection<int, array{businessName: string, slug: string, city: string, category: string, rating: float, reviewsCount: int, minPrice: float|null, services: list<string>}>
     */
    public function searchProviders(string $question): Collection
    {
        $keywords = $this->keywords($question);

        $query = BusinessProfile::query()
            ->whereNotNull('slug')
            ->whereHas('user', fn (Builder $q) => $q->where('is_verified', true))
            ->whereHas('user.services', fn (Builder $q) => $q->where('status', 'active'));

        $matches = $keywords === []
            ? collect()
            : (clone $query)->where(function (Builder $q) use ($keywords): void {
                foreach ($keywords as $word) {
                    $like = '%'.$word.'%';
                    $q->orWhere('business_name', 'like', $like)
                        ->orWhere('category', 'like', $like)
                        ->orWhere('description', 'like', $like)
                        ->orWhere('city', 'like', $like)
                        ->orWhereHas('user.services', fn (Builder $s) => $s->where('status', 'active')
                            ->where(fn (Builder $s) => $s->where('name', 'like', $like)->orWhere('description', 'like', $like)));
                }
            })->limit(30)->get();

        $profiles = $matches->isNotEmpty() ? $matches : $query->limit(30)->get();

        return $this->describeProviders($profiles)
            ->sortByDesc(fn (array $p): float => $p['rating'] * 10 + min($p['reviewsCount'], 50) / 10)
            ->take(self::SEARCH_LIMIT)
            ->values();
    }

    /**
     * @param  Collection<int, BusinessProfile>  $profiles
     * @return Collection<int, array{businessName: string, slug: string, city: string, category: string, rating: float, reviewsCount: int, minPrice: float|null, services: list<string>}>
     */
    private function describeProviders(Collection $profiles): Collection
    {
        $providerIds = $profiles->pluck('user_id')->all();

        $services = Service::query()
            ->whereIn('provider_id', $providerIds)
            ->where('status', 'active')
            ->get(['provider_id', 'name', 'price'])
            ->groupBy('provider_id');

        $ratings = Review::query()
            ->whereIn('provider_id', $providerIds)
            ->selectRaw('provider_id, AVG(rating) as avg_rating, COUNT(*) as reviews_count')
            ->groupBy('provider_id')
            ->get()
            ->keyBy('provider_id');

        return $profiles->map(function (BusinessProfile $profile) use ($services, $ratings): array {
            $own = $services->get($profile->user_id, collect());
            $rating = $ratings->get($profile->user_id);

            return [
                'businessName' => (string) $profile->business_name,
                'slug' => (string) $profile->slug,
                'city' => (string) ($profile->city ?: $profile->state ?: ''),
                'category' => (string) ($profile->category ?? ''),
                'rating' => $rating ? round((float) $rating->avg_rating, 1) : 0.0,
                'reviewsCount' => $rating ? (int) $rating->reviews_count : 0,
                'minPrice' => $own->isEmpty() ? null : (float) $own->min('price'),
                'services' => $own->pluck('name')->take(5)->values()->all(),
            ];
        });
    }

    /**
     * @return list<string>
     */
    private function keywords(string $question): array
    {
        $words = preg_split('/[^\p{L}\p{N}]+/u', Str::lower($question), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $words = array_filter(
            $words,
            fn (string $w): bool => mb_strlen($w) >= 3 && ! in_array($w, self::STOP_WORDS, true) && ! is_numeric($w),
        );

        // "plumbers" should also match "plumber".
        $words = array_map(fn (string $w): string => mb_strlen($w) > 4 ? Str::singular($w) : $w, $words);

        return array_slice(array_values(array_unique($words)), 0, 6);
    }

    /**
     * @param  Collection<int, array{businessName: string, slug: string, city: string, category: string, rating: float, reviewsCount: int, minPrice: float|null, services: list<string>}>  $providers
     */
    private function marketplacePrompt(Collection $providers): string
    {
        $list = $providers->isEmpty()
            ? 'No providers matched.'
            : $providers->map(fn (array $p): string => sprintf(
                '- %s | %s | %s | rating %s (%d reviews) | from %s | services: %s',
                $p['businessName'],
                $p['category'] ?: 'general',
                $p['city'] ?: 'location not listed',
                $p['rating'] ?: 'none yet',
                $p['reviewsCount'],
                $p['minPrice'] !== null ? '₦'.number_format($p['minPrice']) : 'price on request',
                implode(', ', $p['services']) ?: 'not listed',
            ))->implode("\n");

        return <<<PROMPT
        You are Kiro, the friendly assistant on Proxideck, a marketplace where people in Nigeria find and book trusted artisans and service providers (hairstylists, plumbers, cleaners, mechanics and more).

        Your job: help the client find the right provider and explain how booking works.

        Rules:
        - Only recommend providers from the list below, using their exact business names. Never invent providers, prices, ratings or availability.
        - If nothing in the list fits, say so honestly and suggest they search with different words or browse the homepage.
        - Prices are in Naira (₦). The list shows each provider's lowest price.
        - You cannot make bookings. To book, the client opens the provider's page and taps Book.
        - Keep replies short: 2 to 4 sentences, or a short list of at most 3 providers. Plain text only, no markdown headings, tables or bold.
        - If asked something unrelated to finding or booking services, politely steer back.

        How booking works on Proxideck: open a provider, pick a service, choose a date and time slot, then confirm and pay. You can track appointments from your account.

        Providers matching the client's request:
        {$list}
        PROMPT;
    }

    private function businessPrompt(BusinessProfile $business): string
    {
        $provider = $business->user;

        $services = Service::query()
            ->where('provider_id', $provider->id)
            ->where('status', 'active')
            ->orderBy('price')
            ->get(['name', 'description', 'price', 'duration_minutes'])
            ->map(fn (Service $s): string => sprintf(
                '- %s: ₦%s, about %d min%s',
                $s->name,
                number_format((float) $s->price),
                (int) $s->duration_minutes,
                $s->description ? ' ('.Str::limit((string) $s->description, 120).')' : '',
            ))
            ->implode("\n") ?: 'No services listed yet.';

        $rating = Review::query()->where('provider_id', $provider->id);
        $reviewsCount = (clone $rating)->count();
        $ratingText = $reviewsCount > 0
            ? round((float) $rating->avg('rating'), 1)." out of 5 from {$reviewsCount} reviews"
            : 'no reviews yet';

        $hours = $this->workHours($provider);
        $location = collect([$business->address, $business->city, $business->state])->filter()->implode(', ') ?: 'not listed';
        $description = Str::limit((string) $business->description, 500) ?: 'No description.';
        $today = now()->format('l');

        return <<<PROMPT
        You are Kiro, the assistant for "{$business->business_name}" on Proxideck, a marketplace for booking artisans and service providers in Nigeria.

        Answer the client's questions about this business only, using the facts below. Never invent services, prices, discounts or availability. If you don't know, say so and suggest they book or message the business after booking.

        To book, the client taps "Book now" on this page, picks a service, a date and a time slot, then confirms. You cannot make bookings yourself.

        Keep replies short: 2 to 4 sentences. Plain text only, no markdown headings, tables or bold. Prices are in Naira (₦). Today is {$today}.

        Business: {$business->business_name}
        Category: {$business->category}
        About: {$description}
        Location: {$location}
        Rating: {$ratingText}

        Services:
        {$services}

        Opening hours:
        {$hours}
        PROMPT;
    }

    private function workHours(User $provider): string
    {
        $rows = WorkHour::query()->where('provider_id', $provider->id)->get()->groupBy('day_of_week');

        if ($rows->isEmpty()) {
            return 'Not listed.';
        }

        return collect(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
            ->map(function (string $day) use ($rows): string {
                $open = $rows->get($day, collect())->where('is_closed', false)->filter(fn (WorkHour $h) => $h->start_time && $h->end_time);

                if ($open->isEmpty()) {
                    return "- {$day}: closed";
                }

                $ranges = $open->map(fn (WorkHour $h): string => Carbon::parse($h->start_time)->format('g:i A').' to '.Carbon::parse($h->end_time)->format('g:i A'));

                return "- {$day}: ".$ranges->implode(', ');
            })
            ->implode("\n");
    }

    /**
     * Providers from the search that Kiro actually named, so the chat can show them as cards.
     *
     * @param  Collection<int, array{businessName: string, slug: string, city: string, category: string, rating: float, reviewsCount: int, minPrice: float|null, services: list<string>}>  $providers
     * @return list<array{businessName: string, slug: string, city: string, rating: float, reviewsCount: int, minPrice: float|null}>
     */
    private function mentionedProviders(Collection $providers, string $reply): array
    {
        $reply = Str::lower($reply);

        return $providers
            ->filter(fn (array $p): bool => $p['businessName'] !== '' && str_contains($reply, Str::lower($p['businessName'])))
            ->take(3)
            ->map(fn (array $p): array => Arr::except($p, ['category', 'services']))
            ->values()
            ->all();
    }
}
