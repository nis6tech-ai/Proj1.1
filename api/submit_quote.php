<?php
/**
 * Nutpa - Submit Quote API
 */
require_once 'connect.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Add CORS headers if not already in connect.php
// (Checked connect.php, it has headers line 5-8 as follows:)
// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method !== 'POST') {
    echo json_encode(['error' => 'Invalid request method. Only POST allowed.']);
    exit;
}

// Get form data
// Handle both regular form data and JSON data
$data = [];
$contentType = $_SERVER["CONTENT_TYPE"] ?? "";

if (strpos($contentType, "application/json") !== false) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
} else {
    $data = $_POST;
}

// Validation
$requiredFields = ['name', 'email', 'phone', 'message'];
$errors = [];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        $errors[] = ucfirst($field) . " is required.";
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => implode(" ", $errors)]);
    exit;
}

// Extra field: subject (optional but useful)
$name = trim($data['name']);
$email = trim($data['email']);
$phone = trim($data['phone']);
$subject = !empty($data['subject']) ? trim($data['subject']) : "New Quote Request";
$message = trim($data['message']);

try {
    // 1. Insert into Database
    $sql = "INSERT INTO quotes (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $email, $phone, $subject, $message]);

    // 2. Fetch Admin Settings
    $adminEmail = "sales@nutpa.com"; // Default fallback
    $siteName = "Nutpa Web"; // Default fallback
    try {
        $stmt = $pdo->query("SELECT site_name, contact_email FROM site_settings LIMIT 1");
        $settings = $stmt->fetch();
        if ($settings) {
            if (!empty($settings['contact_email'])) $adminEmail = $settings['contact_email'];
            if (!empty($settings['site_name'])) $siteName = $settings['site_name'];
        }
    } catch (Exception $e) { /* ignore settings fetch errors */ }

    // 3. Construct Email Notification
    $to = $adminEmail;
    $emailSubject = "[$siteName] New Quote Request: " . $subject;
    
    // HTML Email Body
    // ... (rest of the body remains same)
    $body = "
    <html>
    <head>
        <title>New Quote Request</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 20px; }
            .container { background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
            .header h2 { color: #1e3a8a; margin: 0; font-size: 24px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 800; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
            .value { font-size: 16px; color: #1e293b; white-space: pre-wrap; }
            .footer { font-size: 13px; color: #94a3b8; margin-top: 32px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'><h2>New Inquiry Received</h2></div>
            <div class='content'>
                <div class='field'><span class='label'>Customer Name</span><div class='value'>$name</div></div>
                <div class='field'><span class='label'>Email Address</span><div class='value'>$email</div></div>
                <div class='field'><span class='label'>Phone Number</span><div class='value'>$phone</div></div>
                <div class='field'><span class='label'>Subject</span><div class='value'>$subject</div></div>
                <div class='field'><span class='label'>Message</span><div class='value'>$message</div></div>
            </div>
            <div class='footer'>Sent automatically via $siteName Quote Engine.</div>
        </div>
    </body>
    </html>
    ";

    // Headers for HTML Email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: $siteName Notification <noreply@nutpa.com>" . "\r\n";
    $headers .= "Reply-To: $name <$email>" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send Email
    $mailSent = @mail($to, $emailSubject, $body, $headers);

    echo json_encode([
        'success' => true, 
        'message' => 'Quote submitted successfully! Our team will contact you shortly.',
        'mail_status' => $mailSent ? 'Sent' : 'Failed'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Submission failed: ' . $e->getMessage()]);
}
?>
