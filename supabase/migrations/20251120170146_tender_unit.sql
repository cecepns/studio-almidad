-- Belarise Database Schema
-- Created: 2024

CREATE DATABASE IF NOT EXISTS denko_db;
USE denko_db;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    image VARCHAR(255) NOT NULL,
    link VARCHAR(255) DEFAULT NULL,
    order_index INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_order (order_index)
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
);

-- Insert Default Admin User
INSERT INTO admin_users (email, password, name) VALUES 
('admin@denko.co.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator');
-- Password: admin123

-- Insert Default Settings
INSERT INTO settings (setting_key, setting_value) VALUES 
('company_name', 'Belarise'),
('company_address', 'Kawasan Industri de Prima Terra, Jl. Raya Sapan Blok E2/11, Tegalluar Kec. Bojongsoang Kab. Bandung'),
('company_phone', '0881022598949'),
('company_email', 'selvi@denko.co.id'),
('company_about', 'Belarise adalah perusahaan yang bergerak di bidang penyediaan peralatan industri dan solusi teknis untuk berbagai sektor industri. Dengan pengalaman lebih dari 15 tahun, kami telah menjadi partner terpercaya dalam menyediakan solusi industri yang inovatif dan berkualitas tinggi.'),
('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5649999999997!2d107.64320857499044!3d-6.954944893060374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e9adf177bf8d%3A0x5709c5e7f9e7b1f5!2sKawasan%20Industri%20de%20Prima%20Terra!5e0!3m2!1sen!2sid!4v1635000000000!5m2!1sen!2sid');

-- Insert Sample Products
INSERT INTO products (title, slug, description, image, category, status) VALUES 
(
    'Industrial Pump Series IP-2000', 
    'industrial-pump-series-ip-2000',
    '<p>Pompa industri berkualitas tinggi dengan kapasitas 2000 L/min. Dirancang khusus untuk aplikasi industri berat dengan daya tahan maksimal dan efisiensi energi optimal.</p><h3>Spesifikasi Teknis:</h3><ul><li>Kapasitas: 2000 L/min</li><li>Head: 50-80 meter</li><li>Material: Stainless Steel 316L</li><li>Daya: 15 kW</li><li>Sertifikasi: ISO 9001, CE</li></ul><h3>Keunggulan:</h3><ul><li>Tahan korosi dan aus</li><li>Maintenance minimal</li><li>Garansi 2 tahun</li><li>After sales service 24/7</li></ul>',
    'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',
    'Pumps',
    'active'
),
(
    'Conveyor Belt System CB-500', 
    'conveyor-belt-system-cb-500',
    '<p>Sistem conveyor belt heavy duty untuk aplikasi industri manufaktur dan distribusi. Dilengkapi dengan teknologi terdepan untuk efisiensi maksimal.</p><h3>Spesifikasi:</h3><ul><li>Panjang: Customizable hingga 500 meter</li><li>Lebar: 600-1200 mm</li><li>Kapasitas: 500 ton/jam</li><li>Kecepatan: 0.5 - 2.5 m/s</li></ul><h3>Fitur Unggulan:</h3><ul><li>Variable speed control</li><li>Emergency stop system</li><li>Self-cleaning design</li><li>Remote monitoring ready</li></ul>',
    'https://images.pexels.com/photos/3843270/pexels-photo-3843270.jpeg',
    'Conveyors',
    'active'
),
(
    'Hydraulic Press HP-100T', 
    'hydraulic-press-hp-100t',
    '<p>Mesin press hidraulik dengan kapasitas 100 ton untuk berbagai aplikasi forming, stamping, dan assembly. Dilengkapi dengan sistem kontrol digital untuk presisi tinggi.</p><h3>Specifications:</h3><ul><li>Kapasitas: 100 Ton</li><li>Stroke: 200 mm</li><li>Daylight: 600 mm</li><li>Bed Size: 1000 x 800 mm</li></ul><h3>Control System:</h3><ul><li>PLC Control Siemens</li><li>Touch screen HMI</li><li>Safety light curtains</li><li>Pressure monitoring</li></ul>',
    'https://images.pexels.com/photos/2009168/pexels-photo-2009168.jpeg',
    'Hydraulic Equipment',
    'active'
),
(
    'Air Compressor AC-75HP', 
    'air-compressor-ac-75hp',
    '<p>Kompresor udara screw type dengan kapasitas 75 HP untuk kebutuhan udara bertekanan industri. Dilengkapi dengan sistem pendingin dan filter udara untuk kualitas udara optimal.</p><h3>Technical Data:</h3><ul><li>Power: 75 HP (55 kW)</li><li>Air Flow: 11.2 m³/min</li><li>Working Pressure: 7-13 bar</li><li>Noise Level: <75 dB</li></ul><h3>Features:</h3><ul><li>Energy efficient design</li><li>Automatic start/stop</li><li>Built-in air dryer</li><li>Remote monitoring capability</li></ul>',
    'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
    'Compressors',
    'active'
),
(
    'CNC Machining Center MC-1000', 
    'cnc-machining-center-mc-1000',
    '<p>CNC machining center 3-axis untuk precision machining dengan akurasi tinggi. Cocok untuk produksi komponen presisi dalam skala menengah hingga besar.</p><h3>Machine Specifications:</h3><ul><li>Working Area: 1000 x 600 x 500 mm</li><li>Spindle Speed: 12,000 RPM</li><li>Tool Magazine: 20 positions</li><li>Positioning Accuracy: ±0.005 mm</li></ul><h3>Control System:</h3><ul><li>Fanuc 0i-MF Plus</li><li>Conversational programming</li><li>Tool life management</li><li>In-process measurement</li></ul>',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
    'CNC Machines',
    'active'
);

-- Insert Sample Banners
INSERT INTO banners (title, description, image, link, order_index, status) VALUES 
(
    'Solusi Industri Terpercaya',
    'Belarise menyediakan peralatan industri berkualitas tinggi untuk mendukung kebutuhan bisnis Anda',
    'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
    '/products',
    1,
    'active'
),
(
    'Pengalaman 15+ Tahun',
    'Dengan pengalaman lebih dari 15 tahun, kami telah melayani ratusan klien dari berbagai industri',
    'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',
    '/about',
    2,
    'active'
),
(
    'Dukungan Teknis 24/7',
    'Tim ahli kami siap memberikan dukungan teknis dan konsultasi kapan saja Anda membutuhkan',
    'https://images.pexels.com/photos/3843270/pexels-photo-3843270.jpeg',
    '/contact',
    3,
    'active'
);