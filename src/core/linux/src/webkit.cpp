#include "webkit.hpp"
#include "globals.hpp"

void runApplication(int argc, char **argv) {
	auto& config = getConfig();
	auto& app = Globals::app;

	app = gtk_application_new(
		config.value("id", "org.webnative.example").c_str(),
		G_APPLICATION_DEFAULT_FLAGS
	);

	g_signal_connect(app, "activate", G_CALLBACK(activate), nullptr);
	Globals::exitStatus = g_application_run(G_APPLICATION(app), argc, argv);
}

void activate(GtkApplication *app) {
	Globals::webview = createWebviewWindow(app, Globals::config);

	webkit_user_content_manager_register_script_message_handler(
		Globals::contentManager, "webnative", NULL
	);

	g_signal_connect(
		Globals::contentManager,
		"script-message-received::webnative",
		G_CALLBACK(onApiCall),
		NULL
	);
}

WebKitWebView* createWebviewWindow(GtkApplication *app, const nlohmann::json& config) {
	auto window = gtk_application_window_new(app);
	applyConfigToWindow(window, config);

	auto webview = createWebview();
	gtk_window_set_child(GTK_WINDOW(window), GTK_WIDGET(webview));
	loadHtmlToWebview(webview, "index.html");

	applyConfigToWebkitSettings(webview, config);
	gtk_window_present(GTK_WINDOW(window));
	return webview;
}

WebKitWebView* createWebview() {
	Globals::contentManager = webkit_user_content_manager_new();

	WebKitWebView* webview = WEBKIT_WEB_VIEW(
		g_object_new(WEBKIT_TYPE_WEB_VIEW, "user-content-manager", Globals::contentManager, NULL)
	);

	return webview;
}

void applyConfigToWindow(GtkWidget* window, const nlohmann::json& config) {
	gtk_window_set_title(GTK_WINDOW(window), config.value("name", "Webnative application").c_str());

	auto windowConfig = config.value("window", nlohmann::json::object());
	if (windowConfig.value("fullscreen", false)) gtk_window_fullscreen(GTK_WINDOW(window));

	gtk_widget_set_size_request(
		window,
		windowConfig.value("minWidth", 500),
		windowConfig.value("minHeight", 700)
	);

	gtk_window_set_default_size(
		GTK_WINDOW(window),
		windowConfig.value("width", 1200),
		windowConfig.value("height", 700)
	);
}

void loadHtmlToWebview(WebKitWebView* webview, const std::string& html) {
	std::string publicPath = Globals::config.value("appDir", ".") + "/usr/bin/public/" + html;
	GFile *file = g_file_new_for_path(publicPath.c_str());
	gchar *baseURL = g_file_get_uri(file);
	g_object_unref(file);
	webkit_web_view_load_uri(webview, baseURL);
	g_free(baseURL);
}

void applyConfigToWebkitSettings(WebKitWebView* webview, const nlohmann::json& config) {
	WebKitSettings *settings = webkit_web_view_get_settings(webview);
	webkit_settings_set_media_playback_requires_user_gesture(settings, FALSE);
	webkit_settings_set_allow_file_access_from_file_urls(settings, TRUE);

	if (config.value("env", "development") != "development") return; 
	webkit_settings_set_enable_developer_extras(settings, TRUE);
	WebKitWebInspector *inspector = webkit_web_view_get_inspector(webview);
	webkit_web_inspector_show(inspector);
}

void onApiCall(WebKitUserContentManager *manager, JSCValue *value) {
	gchar *gstring = jsc_value_to_string(value);
	std::string data(gstring);
	g_free(gstring);
	handleApiCall(manager, data);
}

void terminateWebkitApp() {
	g_object_unref(Globals::app);
	std::exit(Globals::exitStatus);
}
