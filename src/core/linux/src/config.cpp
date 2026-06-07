#include "config.hpp"
#include "globals.hpp"

nlohmann::json& getConfig(const std::string& name) {
	if (!Globals::config.is_null()) return Globals::config;
	auto appDir = getAppDir();
	auto configPath = appDir + "/usr/bin/" + name;

	std::ifstream file(configPath);
	if (!file.is_open()) throw std::runtime_error("Could not open config file: " + configPath);

	file >> Globals::config;
	Globals::config["appDir"] = appDir;
	Globals::config["nodePath"] = findNode(Globals::config["appDir"]);

	return Globals::config;
}

std::string getAppDir() {
	if (getenv("FLATPAK_ID")) return "/app";

	const char* appDir = getenv("APPDIR");
	if (appDir) return std::string(appDir);

	char buf[4096];
	ssize_t len = readlink("/proc/self/exe", buf, sizeof(buf) - 1);

	if (len != -1) {
		buf[len] = '\0';
		std::string path(buf);
		return path.substr(0, path.find_last_of("/"));
	}

	return ".";
}

std::string findNode(const std::string &appDir) {
	std::string localNode = appDir + "/bin/node";
	if (access(localNode.c_str(), X_OK) == 0) return localNode;

	const char* candidates[] = {
		"/usr/bin/node",
		"/usr/local/bin/node",
		"/opt/homebrew/bin/node",
		nullptr
	};

	for (int i = 0; candidates[i]; i++)
		if (access(candidates[i], X_OK) == 0) return std::string(candidates[i]);

	return "";
}
