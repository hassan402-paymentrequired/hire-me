<?php

namespace App\Http\Controllers\Widget;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Mail\GuestAccountCreatedMail;
use App\Mail\NewBookingMail;
use App\Services\PaystackService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class WidgetPaymentCallbackController extends Controller
{
    /**
     * Handle Paystack callback for widget bookings
     * This page opens in a new window (not iframe) to handle redirect properly
     */
    public function callback(Request $request, $slug, $reference)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        if (!$businessProfile->widget_enabled) {
            return Inertia::render('widget/payment-callback', [
                'success' => false,
                'error' => 'Widget is not enabled.',
            ]);
        }

        // Retrieve booking data from cache
        $bookingData = cache()->get("widget_booking_{$reference}");
        
        if (!$bookingData) {
            return Inertia::render('widget/payment-callback', [
                'success' => false,
                'error' => 'Booking session expired. Please try again.',
            ]);
        }

        // Verify Paystack transaction
        $paystack = new PaystackService();
        $verification = $paystack->verifyTransaction($reference);

        if (!$verification['success'] || $verification['status'] !== 'success') {
            return Inertia::render('widget/payment-callback', [
                'success' => false,
                'error' => 'Payment verification failed. Please contact support.',
                'reference' => $reference,
            ]);
        }

        // Create appointment after successful payment
        try {
            DB::beginTransaction();

            $user = User::findOrFail($bookingData['user_id']);
            $provider = User::findOrFail($bookingData['provider_id']);
            $services = Service::whereIn('id', $bookingData['service_ids'])->get();
            
            $totalDuration = $services->sum('duration_minutes');
            $maxBuffer = $services->max('buffer_time_minutes') ?? 0;
            $startTime = Carbon::parse($bookingData['start_time']);
            $endTime = $startTime->copy()->addMinutes($totalDuration);

            $settings = $provider->businessProfile->settings ?? [];
            $autoConfirm = ($settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false);

            $appointment = Appointment::create([
                'client_id' => $user->id,
                'provider_id' => $provider->id,
                'service_id' => $services->first()->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => $autoConfirm ? 'confirmed' : 'pending',
                'price' => $bookingData['total_price'],
                'notes' => $bookingData['notes'] ?? null,
                'provider_approved' => $autoConfirm,
                'provider_approved_at' => $autoConfirm ? now() : null,
            ]);

            $appointment->services()->sync($bookingData['service_ids']);

            // Credit wallet with payment amount
            $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);
            $amount = $verification['amount'];
            
            // Create deposit transaction
            WalletTransaction::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'type' => 'deposit',
                'amount' => $amount,
                'balance_before' => $wallet->balance,
                'balance_after' => $wallet->balance + $amount,
                'status' => 'completed',
                'description' => 'Payment for widget booking',
                'reference' => $reference,
                'metadata' => [
                    'appointment_id' => $appointment->id,
                    'paystack_reference' => $reference,
                    'source' => 'widget',
                ],
            ]);

            // Update wallet balance
            $wallet->balance += $amount;
            $wallet->save();

            // Hold payment in escrow
            $wallet->holdPayment($bookingData['total_price'], $appointment, "Payment held for widget booking (Paystack)");
            $appointment->update([
                'escrow_status' => 'held',
                'escrow_amount' => $bookingData['total_price'],
            ]);

            DB::commit();

            // Clear cache
            cache()->forget("widget_booking_{$reference}");

            // Send emails
            Mail::to($user->email)->send(new NewBookingMail($appointment));
            if ($bookingData['is_new_user'] && $bookingData['plain_password']) {
                Mail::to($user->email)->send(new GuestAccountCreatedMail($user, $bookingData['plain_password']));
            }

            return Inertia::render('widget/payment-callback', [
                'success' => true,
                'appointment' => [
                    'id' => $appointment->id,
                    'status' => $appointment->status,
                ],
                'message' => 'Payment successful! Your appointment has been booked.',
                'reference' => $reference,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return Inertia::render('widget/payment-callback', [
                'success' => false,
                'error' => 'Failed to complete booking: ' . $e->getMessage(),
                'reference' => $reference,
            ]);
        }
    }
}
