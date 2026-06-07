#pragma once

#include "config.hpp"
#include <wrl.h>
#include <wil/com.h>
#include <WebView2.h>

namespace Globals {
	extern nlohmann::json config;
	extern nlohmann::json authentication;
	extern wil::com_ptr<ICoreWebView2> webview;
	extern wil::com_ptr<ICoreWebView2Controller> controller;
	extern HWND hwnd;
	extern HANDLE pipe[2];
	extern DWORD nodePid;
}
