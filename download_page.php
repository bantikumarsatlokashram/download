<?php
// download_page.php

// Get the directory from the query parameter, default to current directory if not set
$directory = isset($_GET['directory']) ? $_GET['directory'] : '.';
$folderName = basename($directory); // Extract the name of the folder from the directory path
$fileList = []; // Initialize an empty array to store file details

// Check if the provided directory exists and is indeed a directory
if (is_dir($directory)) {
    // Open the directory handle for reading
    if ($handle = opendir($directory)) {
        // Loop through directory entries to find files
        while (false !== ($file = readdir($handle))) {
            // Skip the current (.) and parent (..) directory references
            if ($file != '.' && $file != '..') {
                $filePath = $directory . '/' . $file;
                // Check if the entry is a file (not a directory)
                if (is_file($filePath)) {
                    $fileSize = filesize($filePath); // Get the file size in bytes
                    // Add file details (name and formatted size) to the list
                    $fileList[] = [
                        'name' => $file,
                        'size' => formatSizeUnits($fileSize) // Format size for readability
                    ];
                }
            }
        }
        // Close the directory handle to free resources
        closedir($handle);
    }
}

// Function to format file size into human-readable units
function formatSizeUnits($bytes) {
    if ($bytes >= 1073741824) {
        // Convert bytes to gigabytes (GB)
        $bytes = number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        // Convert bytes to megabytes (MB)
        $bytes = number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        // Convert bytes to kilobytes (KB)
        $bytes = number_format($bytes / 1024, 2) . ' KB';
    } elseif ($bytes > 1) {
        // Represent size in bytes
        $bytes = $bytes . ' bytes';
    } elseif ($bytes == 1) {
        // Singular representation for one byte
        $bytes = '1 byte';
    } else {
        // If no size (empty file)
        $bytes = '0 bytes';
    }

    return $bytes;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css">
    <title>Download Page</title>
    <style>
        body {
            background-color: #f8f9fa; /* Light background for contrast */
            padding: 20px;
        }
        .file-list {
            max-width: 800px;
            margin: auto; /* Center the file list container */
        }
        .file-list-item {
            padding: 15px;
            background: #ffffff; /* White background for file items */
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            opacity: 0; /* Initial opacity for animation */
            transform: translateY(20px); /* Initial position for drop effect */
            animation: dropFadeIn 0.6s ease forwards; /* Fade-in drop animation */
        }
        .file-info {
            flex-grow: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-right: 10px;
            flex-wrap: wrap;
        }
        .file-name {
            margin-right: 20px;
            word-break: break-word; /* Prevent long filenames from overflowing */
        }
        .btn-download {
            margin-top: 10px; /* Margin for better spacing on small screens */
        }
        .btn-download-all {
            width: 100%;
            margin-bottom: 20px;
        }

        @keyframes dropFadeIn {
            0% {
                opacity: 0;
                transform: translateY(-20px); /* Start slightly above */
            }
            100% {
                opacity: 1;
                transform: translateY(0); /* End at original position */
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Display the folder name dynamically -->
        <div class="mb-4">
            <h2 class="text-primary text-center"><?php echo htmlspecialchars($folderName); ?></h2>
            <!-- Button to download all files in the folder -->
            <button id="downloadAll" class="btn btn-success btn-download-all"><i class="fas fa-download"></i> Download All</button>
        </div>
        <div class="file-list" id="fileList">
            <?php foreach ($fileList as $file): ?>
                <div class="file-list-item">
                    <div class="file-info">
                        <!-- Display the name and size of each file -->
                        <span class="file-name"><?php echo htmlspecialchars($file['name']); ?></span>
                        <span class="file-size"><?php echo htmlspecialchars($file['size']); ?></span>
                    </div>
                    <!-- Button to download individual files -->
                    <a href="<?php echo htmlspecialchars($directory . '/' . $file['name']); ?>" download class="btn btn-primary btn-download">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const files = <?php echo json_encode($fileList); ?>;
            const directory = "<?php echo htmlspecialchars($directory); ?>";

            // Add event listener to download all files at once
            document.getElementById("downloadAll").addEventListener("click", () => {
                files.forEach((file) => {
                    // Create an invisible link element to trigger download
                    const link = document.createElement("a");
                    link.href = `${directory}/${file.name}`;
                    link.download = file.name; // Set the download attribute to suggest a filename
                    link.style.display = "none"; // Hide the link element
                    document.body.appendChild(link); // Add the link to the document
                    link.click(); // Programmatically click the link to start download
                    document.body.removeChild(link); // Remove the link from the document
                });
            });
        });
    </script>
</body>
</html>
