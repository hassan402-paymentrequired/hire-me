@extends('emails.layout.app')

@section('title', 'Awaiting confirmation')

@section('heading', 'Awaiting your confirmation')

@section('content')
    <p>Hi {{ $user->name ?? 'there' }},</p>

    <p>We need your input here</p>


@endsection

@section('cta_url', url('/wallet'))
@section('cta_text', 'Approve')
