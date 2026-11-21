<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKiroMessageRequest;
use App\Models\BusinessProfile;
use App\Services\Ai\AiUnavailable;
use App\Services\Ai\KiroAssistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class KiroChatController extends Controller
{
    /**
     * Send the conversation to Kiro and return its reply, plus any providers it recommended.
     */
    public function __invoke(StoreKiroMessageRequest $request, KiroAssistant $kiro): JsonResponse
    {
        $business = $request->filled('provider_slug')
            ? BusinessProfile::query()->with('user')->where('slug', $request->string('provider_slug'))->first()
            : null;

        try {
            return response()->json($kiro->reply($request->validated('messages'), $business));
        } catch (AiUnavailable $e) {
            Log::error('Kiro could not reply', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => "Kiro can't answer right now. Please try again in a moment.",
            ], 503);
        }
    }
}
