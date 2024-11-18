import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/")
public class FileDownloadServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String directoryParam = request.getParameter("directory");
        String directory = (directoryParam != null) ? directoryParam : ".";
        String folderName = new File(directory).getName();
        List<Map<String, String>> fileList = new ArrayList<>();

        File folder = new File(directory);
        if (folder.exists() && folder.isDirectory()) {
            File[] files = folder.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isFile()) {
                        Map<String, String> fileData = new HashMap<>();
                        fileData.put("name", file.getName());
                        fileData.put("size", formatSizeUnits(file.length()));
                        fileList.add(fileData);
                    }
                }
            }
        }

        request.setAttribute("folderName", folderName);
        request.setAttribute("fileList", fileList);
        request.setAttribute("directory", directory);
        request.getRequestDispatcher("/WEB-INF/views/index.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String directory = request.getParameter("directory");
        String filename = request.getParameter("filename");

        if (directory != null && filename != null) {
            Path filePath = Paths.get(directory, filename);
            if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
                response.setContentType("application/octet-stream");
                response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
                Files.copy(filePath, response.getOutputStream());
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found");
            }
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid request parameters");
        }
    }

    private String formatSizeUnits(long bytes) {
        if (bytes >= 1073741824) {
            return String.format("%.2f GB", bytes / 1073741824.0);
        } else if (bytes >= 1048576) {
            return String.format("%.2f MB", bytes / 1048576.0);
        } else if (bytes >= 1024) {
            return String.format("%.2f KB", bytes / 1024.0);
        } else if (bytes > 1) {
            return bytes + " bytes";
        } else if (bytes == 1) {
            return "1 byte";
        } else {
            return "0 bytes";
        }
    }
}

// View (index.jsp) placed in the "WEB-INF/views" folder

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
            <h2 class="text-primary text-center">${folderName}</h2>
            <button id="downloadAll" class="btn btn-success btn-download-all"><i class="fas fa-download"></i> Download All</button>
        </div>
        <div class="file-list" id="fileList">
            <c:forEach var="file" items="${fileList}">
                <div class="file-list-item">
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${file.size}</span>
                    </div>
                    <a href="/download?directory=${directory}&filename=${file.name}" download class="btn btn-primary btn-download">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            </c:forEach>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const files = JSON.parse('${fileListJson}');
            const directory = "${directory}";

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
