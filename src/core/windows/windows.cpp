#include <windows.h>
#include <wrl.h>
#include <wil/com.h>
#include <WebView2.h>
#include <string>
#include <iostream>
#include <algorithm>

using namespace Microsoft::WRL;

namespace env {
    const bool dev = false;
    const int width = 1200;
    const int height = 700;
    const wchar_t title[] = L"App";
    const wchar_t id[] = L"com.example.app";
}

HANDLE backPipe_read, backPipe_write;
HANDLE forthPipe_read, forthPipe_write;
wil::com_ptr<ICoreWebView2> webview;
wil::com_ptr<ICoreWebView2Controller> controller;

std::wstring getAppDir() {
    wchar_t buf[MAX_PATH];
    GetModuleFileNameW(NULL, buf, MAX_PATH);
    std::wstring path(buf);
    return path.substr(0, path.find_last_of(L"\\"));
}

void sendSignal(const std::wstring& script) {
    webview->ExecuteScript(script.c_str(), nullptr);
}

std::string toString(const std::wstring& wstr) {
    int size = WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, nullptr, 0, nullptr, nullptr);
    std::string result(size - 1, 0);
    WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, &result[0], size, nullptr, nullptr);
    return result;
}

std::wstring toWString(const std::string& str) {
    int size = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, nullptr, 0);
    std::wstring result(size - 1, 0);
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &result[0], size);
    return result;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
    case WM_SIZE:
        if (controller) {
            RECT bounds;
            GetClientRect(hwnd, &bounds);
            controller->put_Bounds(bounds);
        }
        break;
    case WM_DESTROY:
        PostQuitMessage(0);
        break;
    default:
        return DefWindowProcW(hwnd, msg, wParam, lParam);
    }
    return 0;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE, LPSTR, int nCmdShow) {
    std::wstring appDir = getAppDir();

    // создаём pipes для IPC
    SECURITY_ATTRIBUTES sa = { sizeof(SECURITY_ATTRIBUTES), NULL, TRUE };
    CreatePipe(&backPipe_read, &backPipe_write, &sa, 0);
    CreatePipe(&forthPipe_read, &forthPipe_write, &sa, 0);

    // запускаем node бекенд
    std::wstring nodePath = appDir + L"\\node.exe";
    std::wstring backendPath = appDir + L"\\backend\\index.js";
    std::wstring cmdLine = L"\"" + nodePath + L"\" \"" + backendPath + L"\"";

    STARTUPINFOW si = { sizeof(STARTUPINFOW) };
    si.hStdInput = forthPipe_read;
    si.hStdOutput = backPipe_write;
    si.dwFlags = STARTF_USESTDHANDLES;
    PROCESS_INFORMATION pi;
    CreateProcessW(NULL, &cmdLine[0], NULL, NULL, TRUE, 0, NULL, NULL, &si, &pi);

    // создаём окно
    WNDCLASSW wc = {};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = L"WebnativeWindow";
    RegisterClassW(&wc);

    HWND hwnd = CreateWindowExW(
        0, L"WebnativeWindow", env::title,
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, env::width, env::height,
        NULL, NULL, hInstance, NULL
    );

    ShowWindow(hwnd, nCmdShow);

    // инициализируем WebView2
    std::wstring dataDir = appDir + L"\\webview2_data";
    CreateCoreWebView2EnvironmentWithOptions(
        nullptr, dataDir.c_str(), nullptr,
        Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
            [hwnd, &appDir](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
                env->CreateCoreWebView2Controller(hwnd,
                    Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
                        [hwnd, &appDir](HRESULT result, ICoreWebView2Controller* ctrl) -> HRESULT {
                            controller = ctrl;
                            controller->get_CoreWebView2(&webview);

                            RECT bounds;
                            GetClientRect(hwnd, &bounds);
                            controller->put_Bounds(bounds);

                            // добавляем IPC мост
                            webview->AddScriptToExecuteOnDocumentCreated(
                                L"window.sendSignalToCpp = (msg) => window.chrome.webview.postMessage(msg);",
                                nullptr
                            );

                            // слушаем сообщения от фронта
                            webview->add_WebMessageReceived(
                                Callback<ICoreWebView2WebMessageReceivedEventHandler>(
                                    [](ICoreWebView2* sender, ICoreWebView2WebMessageReceivedEventArgs* args) -> HRESULT {
                                        wil::unique_cotaskmem_string message;
                                        args->TryGetWebMessageAsString(&message);
                                        std::string msg = toString(message.get());

                                        // отправляем в бекенд
                                        DWORD written;
                                        WriteFile(forthPipe_write, msg.c_str(), msg.size(), &written, NULL);

                                        // читаем ответ
                                        char buf[65536];
                                        std::string response;
                                        DWORD read;
                                        ReadFile(backPipe_read, buf, 65535, &read, NULL);
                                        buf[read] = 0;
                                        response = buf;

                                        std::wstring script = L"window.receiveSignalFromCpp(" + toWString(response) + L");";
                                        sender->ExecuteScript(script.c_str(), nullptr);
                                        return S_OK;
                                    }
                                ).Get(), nullptr
                            );

                            // загружаем фронт
                            std::wstring publicPath = L"file:///" + appDir + L"\\public\\index.html";
                            std::replace(publicPath.begin(), publicPath.end(), L'\\', L'/');
                            webview->Navigate(publicPath.c_str());

                            return S_OK;
                        }
                    ).Get()
                );
                return S_OK;
            }
        ).Get()
    );

    MSG msg = {};
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}
