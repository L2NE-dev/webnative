#include "node.hpp"
#include "globals.hpp"

void forkNode() {
	auto& config = getConfig();

	if (config["nodePath"].is_null()) {
		std::cerr << "Node.js not found, starting in frontend-only mode" << std::endl;
		return;
	}

	pid_t pid = fork();
	if (pid == -1) std::exit(1);

	if (pid != 0) {
		close(Globals::pipe[1]);
		Globals::nodePid = pid;
		return;
	}

	close(Globals::pipe[0]);
	std::string nodePath = Globals::config["nodePath"].get<std::string>();
	std::string backendPath = Globals::config.value("appDir", ".") + "/usr/bin/backend/index.js";

	execlp(
		nodePath.c_str(),
		nodePath.c_str(),
		backendPath.c_str(),
		std::to_string(Globals::pipe[1]).c_str(),
		nullptr
	);

	std::cerr << "Failed to start backend" << std::endl;
	std::exit(1);
}

void terminateNode() {
	if (Globals::nodePid == -1) return;
	kill(Globals::nodePid, SIGTERM);
	waitpid(Globals::nodePid, nullptr, 0);
}