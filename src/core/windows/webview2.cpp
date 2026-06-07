#include "webview2.hpp"
#include "globals.hpp"

void runApplication(HINSTANCE hInstance, int nCmdShow) {
    auto& config = getConfig();

    WNDCLASSW wc = {};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = L"WebnativeWindow";
    RegisterClassW(&wc);

    Globals::hwnd = createWindow(hInstance, config);
    ShowWindow(Globals::hwnd, nCmdShow);
    createWebview(Globals::hwnd, config);

    MSG msg = {};

    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
}

HWND createWindow(HINSTANCE hInstance, const nlohmann::json& config) {
    auto windowConfig = config.value("window", nlohmann::json::object());
    int width = windowConfig.value("width", 1200);
    int height = windowConfig.value("height", 700);
    std::string titleStr = config.value("name", "Webnative application");
    std::wstring title(titleStr.begin(), titleStr.end());

    HWND hwnd = CreateWindowExW(
        0, L"WebnativeWindow", title.c_str(),
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, width, height,
        NULL, NULL, hInstance, NULL
    );

    applyConfigToWindow(hwnd, config);
    return hwnd;
}

void applyConfigToWindow(HWND hwnd, const nlohmann::json& config) {
    auto windowConfig = config.value("window", nlohmann::json::object());
    if (windowConfig.value("fullscreen", false)) ShowWindow(hwnd, SW_MAXIMIZE);

    RECT rect;
    GetWindowRect(hwnd, &rect);
    int minWidth = windowConfig.value("minWidth", 500);
    int minHeight = windowConfig.value("minHeight", 700);
    SetWindowPos(hwnd, NULL, rect.left, rect.top,
        max(rect.right - rect.left, minWidth),
        max(rect.bottom - rect.top, minHeight),
        SWP_NOZORDER
    );
}

void createWebview(HWND hwnd, const nlohmann::json& config) {
    std::string appDirStr = config.value("appDir", ".");
    std::wstring appDir(appDirStr.begin(), appDirStr.end());
    std::wstring dataDir = appDir + L"\\webview2_data";

    CreateCoreWebView2EnvironmentWithOptions(
        nullptr, dataDir.c_str(), nullptr,
        Microsoft::WRL::Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
            [hwnd, appDir](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
                env->CreateCoreWebView2Controller(hwnd,
                    Microsoft::WRL::Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
                        [hwnd, appDir](HRESULT result, ICoreWebView2Controller* ctrl) -> HRESULT {
                            Globals::controller = ctrl;
                            Globals::controller->get_CoreWebView2(&Globals::webview);

                            RECT bounds;
                            GetClientRect(hwnd, &bounds);
                            Globals::controller->put_Bounds(bounds);

                            Globals::webview->AddScriptToExecuteOnDocumentCreated(
                                L"window.sendSignalToCpp = (msg) => window.chrome.webview.postMessage(msg);",
                                nullptr
                            );

                            Globals::webview->add_WebMessageReceived(
                                Microsoft::WRL::Callback<ICoreWebView2WebMessageReceivedEventHandler>(
                                    [](ICoreWebView2* sender, ICoreWebView2WebMessageReceivedEventArgs* args) -> HRESULT {
                                        onApiCall(sender, args);
                                        return S_OK;
                                    }
                                ).Get(), nullptr
                            );

                            applyConfigToWebviewSettings(getConfig());
                            loadHtmlToWebview(appDir);

                            return S_OK;
                        }
                    ).Get()
                );
                return S_OK;
            }
        ).Get()
    );
}

void loadHtmlToWebview(const std::wstring& appDir) {
    std::wstring publicPath = L"file:///" + appDir + L"\\usr\\bin\\public\\index.html";
    std::replace(publicPath.begin(), publicPath.end(), L'\\', L'/');
    Globals::webview->Navigate(publicPath.c_str());
}

void applyConfigToWebviewSettings(const nlohmann::json& config) {
    ICoreWebView2Settings* settings;
    Globals::webview->get_Settings(&settings);

    if (config.value("env", "development") != "development") return;
    settings->put_AreDevToolsEnabled(TRUE);
    Globals::webview->OpenDevToolsWindow();
}

void onApiCall(ICoreWebView2* sender, ICoreWebView2WebMessageReceivedEventArgs* args) {
    wil::unique_cotaskmem_string message;
    args->TryGetWebMessageAsString(&message);
    std::wstring wdata(message.get());
    std::string data(wdata.begin(), wdata.end());
    handleApiCall(sender, data);
}

void terminateWebviewApp() {
    std::exit(0);
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
        case WM_SIZE:
            if (Globals::controller) {
                RECT bounds;
                GetClientRect(hwnd, &bounds);
                Globals::controller->put_Bounds(bounds);
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
