#include "ipc.hpp"
#include "globals.hpp"
#include <iostream>

void setupPipe() {
	if (pipe(Globals::pipe) != -1) return;
	std::exit(1);
}

void sendToWebview(WebKitWebView* webview, const nlohmann::json& object) {
	std::string script = "window.receiveSignalFromCpp(" + object.dump() + ");";
	webkit_web_view_evaluate_javascript(webview, script.c_str(), -1, NULL, NULL, NULL, NULL, NULL);
}

nlohmann::json getFromNode() {
	char data[65536];
	read(Globals::pipe[0], data, 65535);
	return nlohmann::json::parse(data);
}
