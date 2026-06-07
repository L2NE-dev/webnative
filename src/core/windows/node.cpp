#include "node.hpp"
#include "globals.hpp"

void forkNode() {
    auto& config = getConfig();

    if (config["nodePath"].is_null()) {
        std::cerr << "Node.js not found, starting in frontend-only mode" << std::endl;
        return;
    }

    std::string appDirStr = config.value("appDir", ".");
    std::string backendPathStr = appDirStr + "\\usr\\bin\\backend\\index.js";

    if (GetFileAttributesA(backendPathStr.c_str()) == INVALID_FILE_ATTRIBUTES) {
        std::cerr << "Backend not found, starting in frontend-only mode" << std::endl;
        return;
    }

    std::string nodePathStr = config["nodePath"].get<std::string>();
    std::wstring nodePath(nodePathStr.begin(), nodePathStr.end());
    std::wstring backendPath(backendPathStr.begin(), backendPathStr.end());
    std::wstring pipeHandle = std::to_wstring((size_t)Globals::pipe[1]);

    std::wstring cmdLine = L"\"" + nodePath + L"\" \"" + backendPath + L"\" " + pipeHandle;

    STARTUPINFOW si = { sizeof(STARTUPINFOW) };
    PROCESS_INFORMATION pi = {};

    if (!CreateProcessW(NULL, &cmdLine[0], NULL, NULL, TRUE, 0, NULL, NULL, &si, &pi)) {
        std::cerr << "Failed to start backend" << std::endl;
        std::exit(1);
    }

    CloseHandle(Globals::pipe[1]);
    Globals::nodePid = pi.dwProcessId;
    CloseHandle(pi.hThread);
}

void terminateNode() {
    if (Globals::nodePid == 0) return;
    HANDLE process = OpenProcess(PROCESS_TERMINATE, FALSE, Globals::nodePid);
    if (!process) return;
    TerminateProcess(process, 0);
    CloseHandle(process);
}
