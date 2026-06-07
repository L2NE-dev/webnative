#pragma once

#include <nlohmann/json.hpp>
#include <webkitgtk-6.0/webkit/webkit.h>

void setupPipe();
void sendToWebview(WebKitWebView* webview, const nlohmann::json& object);
nlohmann::json getFromNode();