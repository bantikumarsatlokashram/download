const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

const formatSizeUnits = (bytes) => {
    if (bytes >= 1073741824) {
        return (bytes / 1073741824).toFixed(2) + ' GB';
    } else if (bytes >= 1048576) {
        return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes > 1) {
        return bytes + ' bytes';
    } else if (bytes === 1) {
        return '1 byte';
    } else {
        return '0 bytes';
    }
};

app.get('/', (req, res) => {
    const directory = req.query.directory || '.';
    const folderName = path.basename(directory);
    let fileList = [];

    if (fs.existsSync(directory) && fs.lstatSync(directory).isDirectory()) {
        fileList = fs.readdirSync(directory).map((file) => {
            const filePath = path.join(directory, file);
            if (fs.lstatSync(filePath).isFile()) {
                const fileSize = fs.statSync(filePath).size;
                return {
                    name: file,
                    size: formatSizeUnits(fileSize),
                };
            }
        }).filter(file => file !== undefined);
    }

    res.render('index', {
        folderName: folderName,
        fileList: fileList,
        directory: directory
    });
});

app.get('/download', (req, res) => {
    const directory = req.query.directory || '.';
    const filename = req.query.filename;

    if (filename) {
        const filePath = path.join(directory, filename);
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
            return res.download(filePath);
        }
    }
    res.status(404).send('File not found');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

// View (index.ejs) placed in the "views" folder

/*
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
            background-color: #f8f9fa;
            padding: 20px;
        }
        .file-list {
            max-width: 800px;
            margin: auto;
        }
        .file-list-item {
            padding: 15px;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            opacity: 0;
            transform: translateY(20px);
            animation: dropFadeIn 0.6s ease forwards;
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
            word-break: break-word;
        }
        .btn-download {
            margin-top: 10px;
        }
        .btn-download-all {
            width: 100%;
            margin-bottom: 20px;
        }

        @keyframes dropFadeIn {
            0% {
                opacity: 0;
                transform: translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="mb-4">
            <h2 class="text-primary text-center"><%= folderName %></h2>
            <button id="downloadAll" class="btn btn-success btn-download-all"><i class="fas fa-download"></i> Download All</button>
        </div>
        <div class="file-list" id="fileList">
            <% fileList.forEach(function(file) { %>
                <div class="file-list-item">
                    <div class="file-info">
                        <span class="file-name"><%= file.name %></span>
                        <span class="file-size"><%= file.size %></span>
                    </div>
                    <a href="/download?directory=<%= directory %>&filename=<%= file.name %>" download class="btn btn-primary btn-download">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            <% }); %>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const files = <%- JSON.stringify(fileList) %>;
            const directory = "<%= directory %>";

            // Download all files at once
            document.getElementById("downloadAll").addEventListener("click", () => {
                files.forEach((file) => {
                    const link = document.createElement("a");
                    link.href = `/download?directory=${directory}&filename=${file.name}`;
                    link.download = file.name;
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            });
        });
    </script>
</body>
</html>
*/
