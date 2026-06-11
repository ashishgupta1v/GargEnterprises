<?php

use Illuminate\Support\Facades\Artisan;

// Standard artisan command console route
Artisan::command('inspire', function () {
    $this->comment('Garg Enterprises Inventory Management System - Lucknow, India.');
})->purpose('Display an inspiring quote');
