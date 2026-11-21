<?php

use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.nvidia.key' => 'test-key',
        'services.nvidia.base_url' => 'https://nvidia.test/v1',
        'services.nvidia.models' => 'model/first,model/second',
    ]);
});

function nvidiaReply(string $text): array
{
    return ['choices' => [['message' => ['content' => $text], 'finish_reason' => 'stop']]];
}

function verifiedProvider(string $businessName, string $serviceName, float $price): BusinessProfile
{
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => true]);
    $profile = BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'business_name' => $businessName,
        'slug' => str($businessName)->slug()->toString(),
        'category' => 'Home Repairs',
        'city' => 'Lagos',
    ]);
    Service::factory()->create(['provider_id' => $provider->id, 'name' => $serviceName, 'price' => $price]);

    return $profile;
}

it('recommends matching providers from the marketplace', function () {
    verifiedProvider('Ade Plumbing Works', 'Pipe leak repair', 15000);
    verifiedProvider('Glow Hair Studio', 'Braids', 20000);

    Http::fake(['nvidia.test/*' => Http::response(nvidiaReply('Ade Plumbing Works fixes leaks from ₦15,000.'))]);

    $this->postJson(route('kiro.chat'), [
        'messages' => [['role' => 'user', 'content' => 'I need a plumber for a leaking pipe']],
    ])
        ->assertOk()
        ->assertJsonPath('reply', 'Ade Plumbing Works fixes leaks from ₦15,000.')
        ->assertJsonCount(1, 'providers')
        ->assertJsonPath('providers.0.slug', 'ade-plumbing-works');

    Http::assertSent(function (Request $request): bool {
        $system = $request['messages'][0]['content'];

        return $request['model'] === 'model/first'
            && str_contains($system, 'Ade Plumbing Works')
            && ! str_contains($system, 'Glow Hair Studio');
    });
});

it('answers about a single business on its page', function () {
    $profile = verifiedProvider('Glow Hair Studio', 'Knotless braids', 25000);

    Http::fake(['nvidia.test/*' => Http::response(nvidiaReply('Knotless braids cost ₦25,000.'))]);

    $this->postJson(route('kiro.chat'), [
        'provider_slug' => $profile->slug,
        'messages' => [['role' => 'user', 'content' => 'How much are braids?']],
    ])
        ->assertOk()
        ->assertJsonPath('reply', 'Knotless braids cost ₦25,000.')
        ->assertJsonCount(0, 'providers');

    Http::assertSent(fn (Request $request): bool => str_contains($request['messages'][0]['content'], 'Knotless braids: ₦25,000'));
});

it('falls back to the next model when one is rate limited', function () {
    Http::fake([
        'nvidia.test/*' => function (Request $request) {
            return $request['model'] === 'model/first'
                ? Http::response('slow down', 429)
                : Http::response(nvidiaReply('Hello from the second model.'));
        },
    ]);

    $this->postJson(route('kiro.chat'), [
        'messages' => [['role' => 'user', 'content' => 'Hi']],
    ])->assertOk()->assertJsonPath('reply', 'Hello from the second model.');

    expect(Cache::has('nvidia:cooldown:model/first'))->toBeTrue();

    // The rate-limited model is skipped on the next message.
    $this->postJson(route('kiro.chat'), [
        'messages' => [['role' => 'user', 'content' => 'Hi again']],
    ])->assertOk();

    Http::assertSentCount(3);
});

it('strips reasoning from thinking models', function () {
    Http::fake(['nvidia.test/*' => Http::response(nvidiaReply("<think>The user greets me.</think>\n\nHi there!"))]);

    $this->postJson(route('kiro.chat'), [
        'messages' => [['role' => 'user', 'content' => 'Hi']],
    ])->assertOk()->assertJsonPath('reply', 'Hi there!');
});

it('returns 503 when every model fails', function () {
    Http::fake(['nvidia.test/*' => Http::response('down', 500)]);

    $this->postJson(route('kiro.chat'), [
        'messages' => [['role' => 'user', 'content' => 'Hi']],
    ])->assertServiceUnavailable()->assertJsonStructure(['message']);
});

it('requires the last message to come from the client', function () {
    $this->postJson(route('kiro.chat'), [
        'messages' => [['role' => 'assistant', 'content' => 'Hi! Looking for something?']],
    ])->assertUnprocessable()->assertJsonValidationErrors('messages');
});
