<?php
require_once 'connect.php';

try {
    // Increase size for products table
    $pdo->exec("ALTER TABLE products MODIFY COLUMN seo_keywords TEXT");

    // Increase size for categories table
    $pdo->exec("ALTER TABLE categories MODIFY COLUMN seo_keywords TEXT");

    // Increase size for blogs table
    $pdo->exec("ALTER TABLE blogs MODIFY COLUMN seo_keywords TEXT");

    // Update site_settings table (Adding columns individual try-catch blocks)
    try {
        $pdo->exec("ALTER TABLE site_settings ADD COLUMN site_title VARCHAR(255) AFTER contact_address");
    } catch (Exception $e) {
    }
    try {
        $pdo->exec("ALTER TABLE site_settings ADD COLUMN site_keywords TEXT AFTER site_title");
    } catch (Exception $e) {
    }
    try {
        $pdo->exec("ALTER TABLE site_settings ADD COLUMN site_description TEXT AFTER site_keywords");
    } catch (Exception $e) {
    }
    try {
        $pdo->exec("ALTER TABLE site_settings ADD COLUMN site_favicon LONGTEXT AFTER site_description");
    } catch (Exception $e) {
    }

    // Create quotes table for contact form submissions
    $pdo->exec("CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    echo json_encode(['success' => true, 'message' => 'Database schema updated successfully!']);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database update failed: ' . $e->getMessage()]);
}
?>