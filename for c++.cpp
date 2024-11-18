#include <iostream>
#include <filesystem>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <cpprest/http_listener.h>
#include <cpprest/uri.h>
#include <cpprest/json.h>

namespace fs = std::filesystem;
using namespace web;
using namespace web::http;
using namespace web::http::experimental::listener;

struct FileData {
    std::string name;
    std::string size;
};

std::string formatSizeUnits(uintmax_t bytes) {
    std::ostringstream stream;
    if (bytes >= 1073741824) {
        stream << std::fixed << std::setprecision(2) << (bytes / 1073741824.0) << " GB";
    } else if (bytes >= 1048576) {
        stream << std::fixed << std::setprecision(2) << (bytes / 1048576.0) << " MB";
    } else if (bytes >= 1024) {
        stream << std::fixed << std::setprecision(2) << (bytes / 1024.0) << " KB";
    } else if (bytes > 1) {
        stream << bytes << " bytes";
    } else if (bytes == 1) {
        stream << "1 byte";
    } else {
        stream << "0 bytes";
    }
    return stream.str();
}

void handleGet(http_request request) {
    uri uri = request.request_uri();
    auto query = uri::split_query(uri.query());
    std::string directory = query[U("directory")].empty() ? "./" : utility::conversions::to_utf8string(query[U("directory")]);
    std::string folderName = fs::path(directory).filename().string();
    std::vector<FileData> fileList;

    if (fs::exists(directory) && fs::is_directory(directory)) {
        for (const auto& entry : fs::directory_iterator(directory)) {
            if (fs::is_regular_file(entry)) {
                FileData fileData;
                fileData.name = entry.path().filename().string();
                fileData.size = formatSizeUnits(fs::file_size(entry));
                fileList.push_back(fileData);
            }
        }
    }

    json::value jsonResponse;
    jsonResponse[U("folderName")] = json::value::string(folderName);
    json::value filesJson = json::value::array();
    for (size_t i = 0; i < fileList.size(); ++i) {
        json::value fileJson;
        fileJson[U("name")] = json::value::string(fileList[i].name);
        fileJson[U("size")] = json::value::string(fileList[i].size);
        filesJson[i] = fileJson;
    }
    jsonResponse[U("fileList")] = filesJson;

    request.reply(status_codes::OK, jsonResponse);
}

void handleDownload(http_request request) {
    uri uri = request.request_uri();
    auto query = uri::split_query(uri.query());
    std::string directory = query[U("directory")].empty() ? "./" : utility::conversions::to_utf8string(query[U("directory")]);
    std::string filename = utility::conversions::to_utf8string(query[U("filename")]);

    if (!filename.empty()) {
        std::string filePath = directory + "/" + filename;
        if (fs::exists(filePath) && fs::is_regular_file(filePath)) {
            std::ifstream file(filePath, std::ios::in | std::ios::binary);
            if (file) {
                std::ostringstream contents;
                contents << file.rdbuf();
                file.close();

                http_response response(status_codes::OK);
                response.headers().add(U("Content-Disposition"), U("attachment; filename=") + utility::conversions::to_string_t(filename));
                response.set_body(contents.str(), U("application/octet-stream"));
                request.reply(response);
                return;
            }
        }
    }
    request.reply(status_codes::NotFound, U("File not found"));
}

int main() {
    http_listener listener(U("http://localhost:8080"));

    listener.support(methods::GET, [](http_request request) {
        auto path = uri::split_path(request.relative_uri().path());
        if (path.empty() || path[0] == U("")) {
            handleGet(request);
        } else if (path[0] == U("download")) {
            handleDownload(request);
        } else {
            request.reply(status_codes::NotFound, U("Not found"));
        }
    });

    try {
        listener.open().wait();
        std::cout << "Server running on http://localhost:8080" << std::endl;
        std::string line;
        std::getline(std::cin, line);
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    return 0;
} 

/*
This C++ implementation uses Microsoft's C++ REST SDK (also known as Casablanca) to create a simple HTTP server that serves file data in a JSON format and supports file downloads.

To compile this code, you will need to install the C++ REST SDK and link it appropriately in your build environment. The server listens on port 8080 and serves file metadata, as well as handling download requests.
*/
