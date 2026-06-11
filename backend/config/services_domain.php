<?php

/**
 * MeiliSearch Configuration
 *
 * Add to config/services.php (or create as standalone config/meilisearch.php).
 * Used by IndexProductJob and ProductController for search operations.
 */

return [
    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://meilisearch:7700'),
        'key'  => env('MEILISEARCH_KEY', 'masterKey'),

        // Index settings for the 'products' index
        'indexes' => [
            'products' => [
                'primaryKey'        => 'id',
                'searchableAttributes' => [
                    'product_name',
                    'sku_code',
                    'barcode',
                    'brand_name',
                    'category_name',
                    'hsn_code',
                ],
                'filterableAttributes' => [
                    'brand_name',
                    'category_name',
                    'status',
                ],
                'sortableAttributes' => [
                    'product_name',
                    'sku_code',
                ],
                'rankingRules' => [
                    'words',
                    'typo',
                    'proximity',
                    'attribute',
                    'sort',
                    'exactness',
                ],
                'typoTolerance' => [
                    'enabled'      => true,
                    'minWordSizeForTypos' => [
                        'oneTypo'  => 4,
                        'twoTypos' => 8,
                    ],
                ],
            ],
        ],
    ],

    'fcm' => [
        'server_key' => env('FCM_SERVER_KEY'),
        'project_id' => env('FCM_PROJECT_ID'),
    ],

    'message_central' => [
        'customer_id' => env('MESSAGECENTRAL_CUSTOMER_ID', 'C-AA8E1153B91541D'),
        'auth_token'  => env('MESSAGECENTRAL_AUTH_TOKEN', 'eyJhbGciOiJIUzUxMiJ9.eyJzdW1iOiJDLUFBOEUxMTUzQjkxNTQxRCIsIm..'),
        'base_url'    => env('MESSAGECENTRAL_BASE_URL', 'https://cpaas.messagecentral.com/'),
    ],
];
