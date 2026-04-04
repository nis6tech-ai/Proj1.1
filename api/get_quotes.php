<?php
/**
 * Nutpa - Fetch Quotes API (Admin)
 */
require_once 'connect.php';

// In a real app, we'd check for admin session here.
// For this project, we'll keep it simple as requested.

$action = $_GET['action'] ?? 'list';

if ($action === 'list') {
    try {
        $stmt = $pdo->query("SELECT * FROM quotes ORDER BY created_at DESC");
        $quotes = $stmt->fetchAll();
        echo json_encode(['success' => true, 'quotes' => $quotes]);
    } catch (PDOException $e) {
        // Table not found error code
        if ($e->getCode() === '42S02') {
             // Let's try to auto-create it - Self-healing
            $pdo->exec("CREATE TABLE IF NOT EXISTS quotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                subject VARCHAR(255),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            // Return empty list if just created
            echo json_encode(['success' => true, 'quotes' => []]);
        } else {
            echo json_encode(['error' => 'Failed to fetch quotes: ' . $e->getMessage()]);
        }
    }
} elseif ($action === 'delete') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM quotes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Quote deleted successfully']);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Delete failed: ' . $e->getMessage()]);
    }
}
?>
