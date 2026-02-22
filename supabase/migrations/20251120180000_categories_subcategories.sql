-- Categories and Subcategories Migration
-- Created: 2024-11-20

USE denko_db;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status)
);

-- Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    UNIQUE KEY unique_category_subcategory (category_id, slug)
);

-- Update products table to use category_id and subcategory_id
ALTER TABLE products 
ADD COLUMN category_id INT DEFAULT NULL AFTER category,
ADD COLUMN subcategory_id INT DEFAULT NULL AFTER category_id,
ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
ADD FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
ADD INDEX idx_category_id (category_id),
ADD INDEX idx_subcategory_id (subcategory_id);

-- Insert sample categories
INSERT INTO categories (name, slug, description, status) VALUES 
('Pumps', 'pumps', 'Industrial pumps and pumping systems', 'active'),
('Conveyors', 'conveyors', 'Conveyor belt systems and material handling equipment', 'active'),
('Hydraulic Equipment', 'hydraulic-equipment', 'Hydraulic presses and hydraulic systems', 'active'),
('Compressors', 'compressors', 'Air compressors and compressed air systems', 'active'),
('CNC Machines', 'cnc-machines', 'CNC machining centers and precision equipment', 'active');

-- Insert sample subcategories
INSERT INTO subcategories (category_id, name, slug, description, status) VALUES 
((SELECT id FROM categories WHERE slug = 'pumps'), 'Centrifugal Pumps', 'centrifugal-pumps', 'Centrifugal pump systems', 'active'),
((SELECT id FROM categories WHERE slug = 'pumps'), 'Positive Displacement Pumps', 'positive-displacement-pumps', 'Positive displacement pump systems', 'active'),
((SELECT id FROM categories WHERE slug = 'conveyors'), 'Belt Conveyors', 'belt-conveyors', 'Belt conveyor systems', 'active'),
((SELECT id FROM categories WHERE slug = 'conveyors'), 'Roller Conveyors', 'roller-conveyors', 'Roller conveyor systems', 'active'),
((SELECT id FROM categories WHERE slug = 'hydraulic-equipment'), 'Hydraulic Presses', 'hydraulic-presses', 'Hydraulic press machines', 'active'),
((SELECT id FROM categories WHERE slug = 'hydraulic-equipment'), 'Hydraulic Cylinders', 'hydraulic-cylinders', 'Hydraulic cylinder systems', 'active'),
((SELECT id FROM categories WHERE slug = 'compressors'), 'Screw Compressors', 'screw-compressors', 'Screw type air compressors', 'active'),
((SELECT id FROM categories WHERE slug = 'compressors'), 'Reciprocating Compressors', 'reciprocating-compressors', 'Reciprocating air compressors', 'active'),
((SELECT id FROM categories WHERE slug = 'cnc-machines'), 'CNC Milling', 'cnc-milling', 'CNC milling machines', 'active'),
((SELECT id FROM categories WHERE slug = 'cnc-machines'), 'CNC Turning', 'cnc-turning', 'CNC turning machines', 'active');




