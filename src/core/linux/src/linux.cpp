#include "linux.hpp"

int main(int argc, char **argv) {
	setupPipe();
	forkNode();
	runApplication(argc, argv);
	terminate();
}

void terminate() {
	terminateNode();
	terminateWebkitApp();
}
