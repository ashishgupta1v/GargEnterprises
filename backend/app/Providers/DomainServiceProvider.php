<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Catalog\Models\Product;
use App\Domains\Catalog\Observers\ProductObserver;

/**
 * DomainServiceProvider
 *
 * Registers all domain-level services, observers, and commands.
 * This is the single entry point for the modular monolith wiring.
 *
 * Register in config/app.php providers array:
 *   App\Providers\DomainServiceProvider::class,
 */
class DomainServiceProvider extends ServiceProvider
{
    /**
     * Register services into the container.
     */
    public function register(): void
    {
        // Singleton: AuditLogService (stateless, reusable)
        $this->app->singleton(
            \App\Domains\Audit\Services\AuditLogService::class,
        );

        // Singleton: DeviceBindingService (stateless)
        $this->app->singleton(
            \App\Domains\Identity\Services\DeviceBindingService::class,
        );
    }

    /**
     * Bootstrap domain services after all providers are registered.
     */
    public function boot(): void
    {
        // ── Observers ──
        Product::observe(ProductObserver::class);

        // ── Artisan Commands ──
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Domains\Inventory\Commands\AlertEngineCommand::class,
            ]);
        }

        // ── Scheduled Tasks ──
        // Register in Console\Kernel::schedule():
        //   $schedule->command('inventory:alerts')->dailyAt('06:00')->timezone('Asia/Kolkata');
    }
}
