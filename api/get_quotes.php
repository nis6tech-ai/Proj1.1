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
        echo json_encode(['error' => 'Failed to fetch quotes: ' . $e->getMessage()]);
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
