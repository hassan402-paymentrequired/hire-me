<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClientAddressController extends Controller
{
    public function index()
    {
        $user = auth_user();

        $addresses = ClientAddress::query()
            ->where('user_id', $user->id)
            ->orderByDesc('is_active')
            ->orderByDesc('created_at')
            ->get([
                'id',
                'label',
                'address',
                'city',
                'state',
                'latitude',
                'longitude',
                'is_active',
                'created_at',
            ]);

        return Inertia::render('client/settings/addresses', [
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth_user();

        $data = $request->validate([
            'label' => 'required|string|max:100',
            'address' => 'required|string|max:500',
            'city' => 'nullable|string|max:120',
            'state' => 'nullable|string|max:120',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);

        $address = DB::transaction(function () use ($data, $user) {
            $makeActive = array_key_exists('is_active', $data)
                ? (bool) $data['is_active']
                : true;

            $shouldActivate = $makeActive;
            if (! $makeActive) {
                $hasActive = ClientAddress::query()
                    ->where('user_id', $user->id)
                    ->where('is_active', true)
                    ->exists();

                $shouldActivate = ! $hasActive;
            }

            if ($shouldActivate) {
                ClientAddress::query()
                    ->where('user_id', $user->id)
                    ->update(['is_active' => false]);
            }

            return ClientAddress::query()->create([
                ...$data,
                'user_id' => $user->id,
                'is_active' => $shouldActivate,
            ]);
        });

        return response()->json([
            'address' => $address->only([
                'id',
                'label',
                'address',
                'city',
                'state',
                'latitude',
                'longitude',
                'is_active',
                'created_at',
            ]),
        ], 201);
    }

    public function update(Request $request, ClientAddress $clientAddress)
    {
        $user = auth_user();

        if ($clientAddress->user_id !== $user->id) {
            abort(403);
        }

        $data = $request->validate([
            'label' => 'required|string|max:100',
            'address' => 'required|string|max:500',
            'city' => 'nullable|string|max:120',
            'state' => 'nullable|string|max:120',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);

        $isActiveProvided = array_key_exists('is_active', $data);
        $wantsActive = $isActiveProvided ? (bool) $data['is_active'] : null;

        $address = DB::transaction(function () use ($clientAddress, $user, $data, $isActiveProvided, $wantsActive) {
            $clientAddress->update([
                'label' => $data['label'],
                'address' => $data['address'],
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
            ]);

            if ($isActiveProvided) {
                if ($wantsActive) {
                    ClientAddress::query()
                        ->where('user_id', $user->id)
                        ->where('id', '!=', $clientAddress->id)
                        ->update(['is_active' => false]);

                    $clientAddress->update(['is_active' => true]);
                } elseif ($clientAddress->is_active) {
                    $replacement = ClientAddress::query()
                        ->where('user_id', $user->id)
                        ->where('id', '!=', $clientAddress->id)
                        ->orderByDesc('created_at')
                        ->first();

                    if ($replacement) {
                        $clientAddress->update(['is_active' => false]);
                        $replacement->update(['is_active' => true]);
                    }
                }
            }

            return $clientAddress->fresh([
                'id',
                'label',
                'address',
                'city',
                'state',
                'latitude',
                'longitude',
                'is_active',
                'created_at',
            ]);
        });

        return response()->json([
            'address' => $address,
        ]);
    }

    public function destroy(ClientAddress $clientAddress)
    {
        $user = auth_user();

        if ($clientAddress->user_id !== $user->id) {
            abort(403);
        }

        $wasActive = $clientAddress->is_active;

        DB::transaction(function () use ($clientAddress, $user, $wasActive) {
            $clientAddress->delete();

            if ($wasActive) {
                $replacement = ClientAddress::query()
                    ->where('user_id', $user->id)
                    ->orderByDesc('created_at')
                    ->first();

                if ($replacement) {
                    $replacement->update(['is_active' => true]);
                }
            }
        });

        return response()->json(['deleted' => true]);
    }
}
