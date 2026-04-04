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
    $projectId = $data['project_id'] ?? 'nutpa';
    try {
        $sql = "INSERT INTO quotes (name, email, phone, subject, message, project_id) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $email, $phone, $subject, $message, $projectId]);
    } catch (PDOException $e) {
        if ($e->getCode() === '42S02') {
            // Auto-create table if missing
            $pdo->exec("CREATE TABLE IF NOT EXISTS quotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                subject VARCHAR(255),
                message TEXT,
                project_id VARCHAR(50) DEFAULT 'nutpa',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            // Retry insert
            $stmt = $pdo->prepare("INSERT INTO quotes (name, email, phone, subject, message, project_id) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $phone, $subject, $message, $projectId]);
        } else if ($e->getCode() === '42S22') {
            // Column missing, try to add it
            try {
                $pdo->exec("ALTER TABLE quotes ADD COLUMN project_id VARCHAR(50) DEFAULT 'nutpa'");
                // Retry insert
                $stmt = $pdo->prepare("INSERT INTO quotes (name, email, phone, subject, message, project_id) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$name, $email, $phone, $subject, $message, $projectId]);
            } catch (Exception $e2) {
                throw $e; // Throw original if alter fails
            }
        } else {
            throw $e;
        }
    }

    // 2. Fetch Admin Settings
    $adminEmail = "sales@nutpa.com"; // Default fallback
    $siteName = "Nutpa Web"; // Default fallback
    try {
        $stmt = $pdo->prepare("SELECT site_name, contact_email FROM site_settings WHERE project_id = ? LIMIT 1");
        $stmt->execute([$projectId]);
        $settings = $stmt->fetch();
        if ($settings) {
            if (!empty($settings['contact_email']))
                $adminEmail = $settings['contact_email'];
            if (!empty($settings['site_name']))
                $siteName = $settings['site_name'];
        }
    } catch (Exception $e) { /* ignore settings fetch errors */
    }

    // 3. Construct Email Notification
    require_once 'SmtpHelper.php';

    $to = $adminEmail;
    $emailSubject = "[$siteName] New Quote Request: " . $subject;

    // HTML Email Body
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
            .label { font-weight: 800; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
            .value { font-size: 15px; color: #1e293b; font-weight: 600; white-space: pre-wrap; }
            .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px; }
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
                <div class='field'><span class='label'>Site Brand</span><div class='value'>$siteName ($projectId)</div></div>
            </div>
            <div class='footer'>Sent automatically via $siteName Quote Engine.</div>
        </div>
    </body>
    </html>
    ";

    // Send Email via Zoho SMTP
    $mailSent = false;
    try {
        $smtp = new SimpleSmtp('smtp.zoho.in', 465, 'support@rentla.in', 'DmYTCmEFuVYH');
        $headersExtra = [
            "Reply-To" => "$name <$email>",
            "X-Mailer" => "PHP/" . phpversion()
        ];
        $mailSent = $smtp->send($to, $emailSubject, $body, $headersExtra);

        // 4. Send Auto-Reply to Customer
        try {
           $customerSubject = "Confirmation: Your Inquiry to $siteName Received";
           $customerBody = "
           <html>
           <head>
               <style>
                   body { font-family: 'Segoe UI', sans-serif; color: #1e293b; background: #f1f5f9; padding: 20px; }
                   .card { background: #ffffff; padding: 40px; border-radius: 20px; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; }
                   .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: #ffffff !important; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px; }
                   .footer { margin-top: 30px; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
               </style>
           </head>
           <body>
               <div class='card'>
                   <h2 style='color:#1e3a8a;'>Hi $name,</h2>
                   <p style='font-size:16px; line-height:1.6;'>Thank you for reaching out to <strong>$siteName</strong>! We have successfully received your inquiry about <strong>\"$subject\"</strong>.</p>
                   <p style='font-size:16px; line-height:1.6;'>Our team is currently reviewing your message and we will contact you shortly via this email or your phone number ($phone).</p>
                   <a href='https://" . ($_SERVER['SERVER_NAME'] ?? 'nutpa.in') . "' class='btn'>Browse More Products</a>
                   <div class='footer'>
                       Best Regards,<br>
                       <strong>The $siteName Team</strong><br>
                       Email: $adminEmail<br>
                       Address: Chennai, Tamil Nadu
                   </div>
               </div>
           </body>
           </html>
           ";
           $smtp->send($email, $customerSubject, $customerBody);
        } catch (Exception $e2) { /* ignore auto-reply failures to not block original success */ }
    } catch (Exception $e) {
        $errorMsg = $e->getMessage();
        error_log("SMTP Error: " . $errorMsg);
    }

    echo json_encode([
        'success' => true,
        'message' => $mailSent ? 'Quote submitted successfully! Our team will contact you shortly.' : 'Quote saved in database, but email notification failed (SMTP Error). Please call us directly.',
        'mail_status' => $mailSent ? 'Sent' : 'Failed'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Submission failed: ' . $e->getMessage()]);
}
?>