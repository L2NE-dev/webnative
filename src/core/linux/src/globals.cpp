#include "globals.hpp"

namespace Globals {
	nlohmann::json config;
	nlohmann::json authentication;
	WebKitWebView *webview = nullptr;
	WebKitUserContentManager* contentManager = nullptr;
	GtkApplication *app = nullptr;
	int pipe[2] = { -1, -1 };
	int exitStatus = 1;
	int nodePid = -1;
}
