<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Phase1Seeder — Seeds the database with realistic test data
 *
 * Creates: 1 Owner, 1 Manager, 1 Staff, 1 Godown user
 * Plus: brands, categories (3-level tree), locations, and sample products.
 */
class Phase1Seeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsers();
        $this->seedBrands();
        $this->seedCategories();
        $this->seedLocations();
        $this->seedSampleProducts();
    }

    private function seedUsers(): void
    {
        DB::table('users')->insert([
            [
                'name'       => 'Ashish Gupta (Owner)',
                'phone'      => '9876543210',
                'pin_hash'   => Hash::make('123456'),
                'role'       => 'owner',
                'device_ids' => '[]',
                'status'     => 'active',
                'created_at' => now(),
            ],
            [
                'name'       => 'Rajesh Kumar (Manager)',
                'phone'      => '9876543211',
                'pin_hash'   => Hash::make('123456'),
                'role'       => 'manager',
                'device_ids' => '[]',
                'status'     => 'active',
                'created_at' => now(),
            ],
            [
                'name'       => 'Vikram Singh (Staff)',
                'phone'      => '9876543212',
                'pin_hash'   => Hash::make('123456'),
                'role'       => 'staff',
                'device_ids' => '[]',
                'status'     => 'active',
                'created_at' => now(),
            ],
            [
                'name'       => 'Amit Verma (Godown)',
                'phone'      => '9876543213',
                'pin_hash'   => Hash::make('123456'),
                'role'       => 'godown',
                'device_ids' => '[]',
                'status'     => 'active',
                'created_at' => now(),
            ],
        ]);
    }

    private function seedBrands(): void
    {
        $brands = [
            ['name' => 'Havells',       'is_authorised' => true],
            ['name' => 'Polycab',       'is_authorised' => true],
            ['name' => 'Anchor',        'is_authorised' => true],
            ['name' => 'Finolex',       'is_authorised' => true],
            ['name' => 'Crompton',      'is_authorised' => true],
            ['name' => 'Legrand',       'is_authorised' => false],
            ['name' => 'Schneider',     'is_authorised' => false],
            ['name' => 'Philips',       'is_authorised' => true],
            ['name' => 'Syska',         'is_authorised' => true],
            ['name' => 'Wipro',         'is_authorised' => false],
        ];

        foreach ($brands as $brand) {
            DB::table('brands')->insert([
                'name'          => $brand['name'],
                'slug'          => Str::slug($brand['name']),
                'is_authorised' => $brand['is_authorised'],
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }

    private function seedCategories(): void
    {
        // Level 1
        $electrical = DB::table('categories')->insertGetId([
            'parent_id'  => null,
            'name'       => 'Electrical',
            'slug'       => 'electrical',
            'level'      => 1,
            'path'       => 'electrical',
            'sort_order' => 1,
        ]);

        $plumbing = DB::table('categories')->insertGetId([
            'parent_id'  => null,
            'name'       => 'Plumbing & Sanitary',
            'slug'       => 'plumbing-sanitary',
            'level'      => 1,
            'path'       => 'plumbing_sanitary',
            'sort_order' => 2,
        ]);

        // Level 2 under Electrical
        $wiring = DB::table('categories')->insertGetId([
            'parent_id'  => $electrical,
            'name'       => 'Wires & Cables',
            'slug'       => 'wires-cables',
            'level'      => 2,
            'path'       => 'electrical.wires_cables',
            'sort_order' => 1,
        ]);

        $lighting = DB::table('categories')->insertGetId([
            'parent_id'  => $electrical,
            'name'       => 'Lighting',
            'slug'       => 'lighting',
            'level'      => 2,
            'path'       => 'electrical.lighting',
            'sort_order' => 2,
        ]);

        $switches = DB::table('categories')->insertGetId([
            'parent_id'  => $electrical,
            'name'       => 'Switches & Sockets',
            'slug'       => 'switches-sockets',
            'level'      => 2,
            'path'       => 'electrical.switches_sockets',
            'sort_order' => 3,
        ]);

        $mcb = DB::table('categories')->insertGetId([
            'parent_id'  => $electrical,
            'name'       => 'MCB & Distribution',
            'slug'       => 'mcb-distribution',
            'level'      => 2,
            'path'       => 'electrical.mcb_distribution',
            'sort_order' => 4,
        ]);

        // Level 3 under Lighting
        DB::table('categories')->insert([
            ['parent_id' => $lighting, 'name' => 'LED Panels', 'slug' => 'led-panels', 'level' => 3, 'path' => 'electrical.lighting.led_panels', 'sort_order' => 1],
            ['parent_id' => $lighting, 'name' => 'LED Bulbs', 'slug' => 'led-bulbs', 'level' => 3, 'path' => 'electrical.lighting.led_bulbs', 'sort_order' => 2],
            ['parent_id' => $lighting, 'name' => 'Tube Lights', 'slug' => 'tube-lights', 'level' => 3, 'path' => 'electrical.lighting.tube_lights', 'sort_order' => 3],
            ['parent_id' => $lighting, 'name' => 'Downlights', 'slug' => 'downlights', 'level' => 3, 'path' => 'electrical.lighting.downlights', 'sort_order' => 4],
        ]);

        // Level 3 under Wires
        DB::table('categories')->insert([
            ['parent_id' => $wiring, 'name' => 'Housewire', 'slug' => 'housewire', 'level' => 3, 'path' => 'electrical.wires_cables.housewire', 'sort_order' => 1],
            ['parent_id' => $wiring, 'name' => 'Armoured Cable', 'slug' => 'armoured-cable', 'level' => 3, 'path' => 'electrical.wires_cables.armoured_cable', 'sort_order' => 2],
            ['parent_id' => $wiring, 'name' => 'Flexible Wire', 'slug' => 'flexible-wire', 'level' => 3, 'path' => 'electrical.wires_cables.flexible_wire', 'sort_order' => 3],
        ]);

        // Level 2 under Plumbing
        DB::table('categories')->insert([
            ['parent_id' => $plumbing, 'name' => 'PVC Pipes', 'slug' => 'pvc-pipes', 'level' => 2, 'path' => 'plumbing_sanitary.pvc_pipes', 'sort_order' => 1],
            ['parent_id' => $plumbing, 'name' => 'Fittings', 'slug' => 'fittings', 'level' => 2, 'path' => 'plumbing_sanitary.fittings', 'sort_order' => 2],
            ['parent_id' => $plumbing, 'name' => 'Taps & Faucets', 'slug' => 'taps-faucets', 'level' => 2, 'path' => 'plumbing_sanitary.taps_faucets', 'sort_order' => 3],
        ]);
    }

    private function seedLocations(): void
    {
        // Ground Floor
        $gf = DB::table('locations')->insertGetId([
            'parent_id' => null, 'name' => 'Ground Floor', 'code' => 'GF', 'type' => 'floor', 'is_active' => true,
        ]);

        // Sections under GF
        $gfA = DB::table('locations')->insertGetId([
            'parent_id' => $gf, 'name' => 'Section A (Electrical)', 'code' => 'GF-SA', 'type' => 'section', 'is_active' => true,
        ]);
        $gfB = DB::table('locations')->insertGetId([
            'parent_id' => $gf, 'name' => 'Section B (Lighting)', 'code' => 'GF-SB', 'type' => 'section', 'is_active' => true,
        ]);

        // Aisles under GF-SA
        $aisle1 = DB::table('locations')->insertGetId([
            'parent_id' => $gfA, 'name' => 'Aisle 1', 'code' => 'GF-SA-A1', 'type' => 'aisle', 'is_active' => true,
        ]);

        // Bins under Aisle 1
        DB::table('locations')->insert([
            ['parent_id' => $aisle1, 'name' => 'Bin 1', 'code' => 'GF-SA-A1-B1', 'type' => 'bin', 'capacity_units' => 500, 'is_active' => true],
            ['parent_id' => $aisle1, 'name' => 'Bin 2', 'code' => 'GF-SA-A1-B2', 'type' => 'bin', 'capacity_units' => 500, 'is_active' => true],
            ['parent_id' => $aisle1, 'name' => 'Bin 3', 'code' => 'GF-SA-A1-B3', 'type' => 'bin', 'capacity_units' => 300, 'is_active' => true],
        ]);

        // First Floor
        $ff = DB::table('locations')->insertGetId([
            'parent_id' => null, 'name' => 'First Floor', 'code' => 'FF', 'type' => 'floor', 'is_active' => true,
        ]);

        DB::table('locations')->insert([
            ['parent_id' => $ff, 'name' => 'Section C (Plumbing)', 'code' => 'FF-SC', 'type' => 'section', 'is_active' => true, 'capacity_units' => null],
            ['parent_id' => $ff, 'name' => 'Section D (Storage)', 'code' => 'FF-SD', 'type' => 'section', 'is_active' => true, 'capacity_units' => null],
        ]);
    }

    private function seedSampleProducts(): void
    {
        $products = [
            ['sku' => 'HAV-WIRE-1.5', 'name' => 'Havells Lifeline 1.5 sq mm Wire', 'brand' => 1, 'cat' => 11, 'uom' => 'meter', 'reorder' => 500, 'hsn' => '85441190'],
            ['sku' => 'HAV-WIRE-2.5', 'name' => 'Havells Lifeline 2.5 sq mm Wire', 'brand' => 1, 'cat' => 11, 'uom' => 'meter', 'reorder' => 300, 'hsn' => '85441190'],
            ['sku' => 'POL-WIRE-4.0', 'name' => 'Polycab Etira 4.0 sq mm Wire', 'brand' => 2, 'cat' => 11, 'uom' => 'meter', 'reorder' => 200, 'hsn' => '85441190'],
            ['sku' => 'HAV-LED-9W',   'name' => 'Havells Adore LED 9W Bulb', 'brand' => 1, 'cat' => 8, 'uom' => 'pcs', 'reorder' => 100, 'hsn' => '94054090'],
            ['sku' => 'PHI-LED-12W',  'name' => 'Philips AceBright 12W LED', 'brand' => 8, 'cat' => 8, 'uom' => 'pcs', 'reorder' => 80, 'hsn' => '94054090'],
            ['sku' => 'SYS-LED-15W',  'name' => 'Syska SSK-QA 15W Panel', 'brand' => 9, 'cat' => 7, 'uom' => 'pcs', 'reorder' => 50, 'hsn' => '94054090'],
            ['sku' => 'ANC-SW-6A',    'name' => 'Anchor Roma 6A Switch', 'brand' => 3, 'cat' => 5, 'uom' => 'pcs', 'reorder' => 200, 'hsn' => '85365090'],
            ['sku' => 'LEG-MCB-16A',  'name' => 'Legrand RX3 16A SP MCB', 'brand' => 6, 'cat' => 6, 'uom' => 'pcs', 'reorder' => 30, 'hsn' => '85362090'],
            ['sku' => 'CRO-FAN-48',   'name' => 'Crompton HighFlo 48" Ceiling Fan', 'brand' => 5, 'cat' => 1, 'uom' => 'pcs', 'reorder' => 20, 'hsn' => '84145190'],
            ['sku' => 'FIN-PIPE-1',   'name' => 'Finolex 1" PVC Pipe (ISI)', 'brand' => 4, 'cat' => 14, 'uom' => 'meter', 'reorder' => 100, 'hsn' => '39172910'],
        ];

        foreach ($products as $p) {
            $productId = DB::table('products')->insertGetId([
                'sku_code'       => $p['sku'],
                'barcode'        => '890' . str_pad(rand(10000000, 99999999), 10, '0'),
                'product_name'   => $p['name'],
                'brand_id'       => $p['brand'],
                'category_id'    => $p['cat'],
                'uom_base'       => $p['uom'],
                'uom_conversion' => 1.0000,
                'reorder_point'  => $p['reorder'],
                'hsn_code'       => $p['hsn'],
                'metadata'       => null,
                'status'         => 'active',
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            // Seed initial stock in GF-SA-A1-B1 (location id 5)
            DB::table('inventory_stock')->insert([
                'product_id'       => $productId,
                'location_id'      => 5,
                'qty_on_hand'      => rand(10, 500),
                'qty_reserved'     => 0,
                'status_flag'      => 'in_stock',
                'last_movement_at' => now(),
            ]);
        }
    }
}
