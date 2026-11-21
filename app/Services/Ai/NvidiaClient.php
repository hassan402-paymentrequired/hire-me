<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Chat completions on NVIDIA's hosted models (build.nvidia.com), OpenAI-style API.
 *
 * Takes a list of models and tries them in order. A model that is rate limited, retired
 * or failing is put on a short cooldown and skipped, so the next available one answers.
 */
class NvidiaClient
{
    public function configured(): bool
    {
        return filled(config('services.nvidia.key')) && $this->models() !== [];
    }

    /**
     * @return list<string>
     */
    public function models(): array
    {
        $models = config('services.nvidia.models', []);

        if (is_string($models)) {
            $models = explode(',', $models);
        }

        return array_values(array_unique(array_filter(array_map('trim', $models))));
    }

    /**
     * Models not currently on cooldown, in priority order.
     *
     * @return list<string>
     */
    public function availableModels(): array
    {
        return array_values(array_filter(
            $this->models(),
            fn (string $model): bool => ! Cache::has($this->cooldownKey($model)),
        ));
    }

    /**
     * @param  list<array{role: string, content: string}>  $messages
     *
     * @throws AiUnavailable when no model could answer
     */
    public function chat(array $messages, int $maxTokens = 600, float $temperature = 0.4): string
    {
        if (! $this->configured()) {
            throw new AiUnavailable('NVIDIA_API_KEY or NVIDIA_MODELS is not set.');
        }

        $candidates = $this->availableModels();

        // Everything is cooling down: still try the first model rather than refuse outright.
        if ($candidates === []) {
            $candidates = [$this->models()[0]];
        }

        $errors = [];

        foreach ($candidates as $model) {
            try {
                return $this->ask($model, $messages, $maxTokens, $temperature);
            } catch (ModelFailed $e) {
                $errors[] = "{$model}: {$e->getMessage()}";
                Cache::put($this->cooldownKey($model), true, $e->cooldownSeconds);
                Log::warning('NVIDIA model skipped', ['model' => $model, 'reason' => $e->getMessage()]);
            }
        }

        throw new AiUnavailable('No NVIDIA model could answer. '.implode(' | ', $errors));
    }

    /**
     * @param  list<array{role: string, content: string}>  $messages
     *
     * @throws ModelFailed
     */
    private function ask(string $model, array $messages, int $maxTokens, float $temperature): string
    {
        try {
            $response = Http::withToken(config('services.nvidia.key'))
                ->acceptJson()
                ->timeout((int) config('services.nvidia.timeout', 30))
                ->post(rtrim(config('services.nvidia.base_url'), '/').'/chat/completions', [
                    'model' => $model,
                    'messages' => $messages,
                    'temperature' => $temperature,
                    'max_tokens' => $maxTokens + (int) config('services.nvidia.thinking_tokens', 0),
                    'stream' => false,
                ]);
        } catch (ConnectionException $e) {
            throw new ModelFailed('unreachable or timed out', 120, $e);
        }

        if ($response->status() === 429) {
            throw new ModelFailed('rate limited', 60);
        }

        if (in_array($response->status(), [401, 403, 404, 410, 422], true)) {
            throw new ModelFailed("not usable ({$response->status()})", 3600);
        }

        if ($response->failed()) {
            throw new ModelFailed("error {$response->status()}", 60);
        }

        $text = $this->withoutThinking((string) $response->json('choices.0.message.content', ''));

        if ($text === '') {
            throw new ModelFailed('empty reply', 30);
        }

        return $text;
    }

    /**
     * Reasoning models can put their thinking in the reply; keep only the answer.
     */
    private function withoutThinking(string $text): string
    {
        $text = preg_replace('/<think>.*?<\/think>/s', '', $text) ?? $text;

        if (str_contains($text, '</think>')) {
            $text = substr($text, strrpos($text, '</think>') + strlen('</think>'));
        }

        return trim($text);
    }

    private function cooldownKey(string $model): string
    {
        return 'nvidia:cooldown:'.$model;
    }
}
