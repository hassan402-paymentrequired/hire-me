<?php

namespace App\Contracts;

interface PaymentGateway
{
    public function initializeCheckout(array $data): array;

    public function verifyPayment(string $reference): array;

    public function getBanks(): array;

    public function initiateTransfer(array $data): array;

    public function verifyTransfer(string $reference): array;
}
