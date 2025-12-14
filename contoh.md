# Bab 9: Halaman Publik (Landing Page)

Halaman utama (`index.php`) berfungsi sebagai Landing Page yang menampilkan peta interaktif untuk publik tanpa perlu login. Halaman ini memuat:
1.  **Map Section**: Peta Leaflet dengan GeoJSON dan Marker.
2.  **Filter Fasilitas**: Kartu interaktif untuk memfilter marker.
3.  **Daftar Fasilitas**: List fasilitas yang tersinkron dengan peta.
4.  **Desain Premium**: CSS Glassmorphism dan layout responsif.

## 9.1 Kode Lengkap `index.php`
Pastikan file ini berada di root folder project.

`File: index.php`
```php
<?php
/**
 * WebGIS Pemetaan Desa - Landing Page
 * Menampilkan informasi lengkap peta desa secara publik
 */

require_once __DIR__ . '/lib/auth.php';
// ... rest of the content
?>
```
