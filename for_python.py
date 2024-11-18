import os
from flask import Flask, render_template_string, request, send_from_directory, jsonify

app = Flask(__name__)

HTML_TEMPLATE = """
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
            <h2 class="text-primary text-center">{{ folder_name }}</h2>
            <button id="downloadAll" class="btn btn-success btn-download-all"><i class="fas fa-download"></i> Download All</button>
        </div>
        <div class="file-list" id="fileList">
            {% for file in file_list %}
                <div class="file-list-item">
                    <div class="file-info">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ file.size }}</span>
                    </div>
                    <a href="/download?directory={{ directory }}&filename={{ file.name }}" download class="btn btn-primary btn-download">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            {% endfor %}
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const files = {{ file_list | tojson }};
            const directory = "{{ directory }}";

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
"""

def format_size_units(bytes):
    if bytes >= 1073741824:
        size = f"{bytes / 1073741824:.2f} GB"
    elif bytes >= 1048576:
        size = f"{bytes / 1048576:.2f} MB"
    elif bytes >= 1024:
        size = f"{bytes / 1024:.2f} KB"
    elif bytes > 1:
        size = f"{bytes} bytes"
    elif bytes == 1:
        size = "1 byte"
    else:
        size = "0 bytes"
    return size

@app.route('/')
def index():
    directory = request.args.get('directory', '.')
    folder_name = os.path.basename(directory)
    file_list = []

    if os.path.isdir(directory):
        for file_name in os.listdir(directory):
            file_path = os.path.join(directory, file_name)
            if os.path.isfile(file_path):
                file_size = os.path.getsize(file_path)
                file_list.append({
                    'name': file_name,
                    'size': format_size_units(file_size)
                })

    return render_template_string(HTML_TEMPLATE, folder_name=folder_name, file_list=file_list, directory=directory)

@app.route('/download')
def download():
    directory = request.args.get('directory', '.')
    filename = request.args.get('filename')
    if filename:
        return send_from_directory(directory, filename, as_attachment=True)
    return "File not found", 404

if __name__ == '__main__':
    app.run(debug=True)
