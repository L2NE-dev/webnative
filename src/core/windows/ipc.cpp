#include "ipc.hpp"
#include "globals.hpp"
#include <iostream>

void setupPipe() {
	SECURITY_ATTRIBUTES sa = { sizeof(SECURITY_ATTRIBUTES), NULL, TRUE };
	if (CreatePipe(&Globals::pipe[0], &Globals::pipe[1], &sa, 0)) return;
	std::exit(1);
}

void sendToWebview(ICoreWebView2* webview, const nlohmann::json& object) {
	std::string script = "window.receiveSignalFromCpp(" + object.dump() + ");";
	std::wstring wscript(script.begin(), script.end());
	webview->ExecuteScript(wscript.c_str(), nullptr);
}

nlohmann::json getFromNode() {
	char data[65536];
	DWORD bytesRead;
	ReadFile(Globals::pipe[0], data, 65535, &bytesRead, NULL);
	data[bytesRead] = '\0';
	return nlohmann::json::parse(data);
}
