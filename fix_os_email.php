<?php
/**
 * Quick Fix: Set OS Chennai Email to support@rentla.in
 */
require_once 'api/connect.php';

try {
    $correctEmail = 'support@rentla.in'; 
    
    // Update OS Chennai settings
    $stmt = $pdo->prepare("UPDATE site_settings SET contact_email = ? WHERE project_id = 'os-chennai'");
    $stmt->execute([$correctEmail]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "OS Chennai email updated to $correctEmail",
            "affected_rows" => $stmt->rowCount()
        ]);
    } else {
        // If no row was updated, maybe it doesn't exist? Try inserting
        $check = $pdo->prepare("SELECT COUNT(*) FROM site_settings WHERE project_id = 'os-chennai'");
        $check->execute();
        if ($check->fetchColumn() == 0) {
            $insert = $pdo->prepare("INSERT INTO site_settings (project_id, contact_email, site_name) VALUES ('os-chennai', ?, 'OS Chennai')");
            $insert->execute([$correctEmail]);
            echo json_encode(["success" => true, "message" => "OS Chennai record created with email $correctEmail"]);
        } else {
            echo json_encode(["success" => true, "message" => "Email was already set to $correctEmail or same value was updated."]);
        }
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
