#include "windows.hpp"

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE, LPSTR, int nCmdShow) {
	setupPipe();
	forkNode();
	runApplication(hInstance, nCmdShow);
	terminate();
}

void terminate() {
	terminateNode();
	terminateWebviewApp();
}
