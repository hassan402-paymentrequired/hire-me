<?php

namespace App\Actions\Response;

class LoginResponse implements LoginResponseContracableInterface
{
    public function toResponse($request)
    {
        return redirect('/');
    }
}
