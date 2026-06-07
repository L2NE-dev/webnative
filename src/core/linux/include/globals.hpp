#pragma once

#include "config.hpp"
#include <webkitgtk-6.0/webkit/webkit.h>

namespace Globals {
	extern nlohmann::json config;
	extern nlohmann::json authentication;
	extern WebKitWebView* webview;
	extern WebKitUserContentManager* contentManager;
	extern GtkApplication* app;
	extern int pipe[2];
	extern int exitStatus;
	extern int nodePid;
}
