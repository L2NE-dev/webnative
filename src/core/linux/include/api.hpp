#pragma once

#include "ipc.hpp"
#include <webkitgtk-6.0/webkit/webkit.h>

void handleApiCall(WebKitUserContentManager *manager, const std::string& data);
void authenticate();
