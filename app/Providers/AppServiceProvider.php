<?php

namespace App\Providers;

use App\Contracts\PaymentGateway;
use App\Services\PayEngineService;
use App\Services\PaystackService;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentGateway::class, function (): PaymentGateway {
            return config('services.payengine.provider') === 'payengine'
                ? $this->app->make(PayEngineService::class)
                : $this->app->make(PaystackService::class);
        });
    }

    public function boot(): void
    {
        Model::unguard();
        $this->configureEmailVerification();
    }

    private function configureEmailVerification(): void
    {
        VerifyEmail::toMailUsing(function (object $notifiable, string $url): MailMessage {
            return (new MailMessage)
                ->subject('Verify your email address — '.config('app.name'))
                ->view('emails.verify-email', [
                    'url' => $url,
                    'user' => $notifiable,
                ]);
        });
    }
}
