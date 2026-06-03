#include <gtk/gtk.h>
#include <webkitgtk-6.0/webkit/webkit.h>
#include <string>
#include <iostream>
#include <unistd.h>

namespace env {
	const bool dev = false;
	const int minWidth = 1600;
	const int minHeight = 900;
	const bool fullscreen = false;
	const char title[] = "App";
	const char id[] = "com.example.app";
}

int backPipe[2], forthPipe[2];
WebKitWebView *web_view;

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
	for (int i = 0; candidates[i]; i++) {
		if (access(candidates[i], X_OK) == 0) return std::string(candidates[i]);
	}

	return "";
}

void sendSignal(const char *script) {
	webkit_web_view_evaluate_javascript(web_view, script, -1, NULL, NULL, NULL, NULL, NULL);
}

static void getSignal(WebKitUserContentManager *manager, JSCValue *value, gpointer userData) {
	if (!jsc_value_is_string(value)) return;
	gchar *str_value = jsc_value_to_string(value);
	write(forthPipe[1], str_value, strlen(str_value));
	char temp[65536];
	std::string message;
	ssize_t size = read(backPipe[0], temp, 65535);
	while (size == 65535) {
		temp[size] = 0;
		message += std::string(temp);
		write(forthPipe[1], "more", 4);
		size = read(backPipe[0], temp, 65535);
	}
	temp[size] = 0;
	message += std::string(temp);
	std::string script = "window.receiveSignalFromCpp(" + message + ");";
	sendSignal(script.c_str());
	g_free(str_value);
}

static void activate(GtkApplication *app, gpointer userData) {
	std::string appDir = *static_cast<std::string*>(userData);

	GtkWidget *window = gtk_application_window_new(app);
	gtk_window_set_title(GTK_WINDOW(window), env::title);
	gtk_widget_set_size_request(window, env::minWidth, env::minHeight);
	gtk_window_set_default_size(GTK_WINDOW(window), 1200, 700);

	WebKitUserContentManager *content_manager = webkit_user_content_manager_new();
	g_signal_connect(content_manager, "script-message-received::cppSignal", G_CALLBACK(getSignal), NULL);
	webkit_user_content_manager_register_script_message_handler(content_manager, "cppSignal", NULL);

	web_view = WEBKIT_WEB_VIEW(g_object_new(WEBKIT_TYPE_WEB_VIEW, "user-content-manager", content_manager, NULL));
	gtk_window_set_child(GTK_WINDOW(window), GTK_WIDGET(web_view));

	std::string publicPath = appDir + "/usr/bin/public/index.html";
	GFile *file = g_file_new_for_path(publicPath.c_str());
	gchar *baseURL = g_file_get_uri(file);
	g_object_unref(file);
	webkit_web_view_load_uri(web_view, baseURL);
	g_free(baseURL);

	if (env::fullscreen) gtk_window_fullscreen(GTK_WINDOW(window));
	gtk_window_present(GTK_WINDOW(window));

	WebKitSettings *settings = webkit_web_view_get_settings(web_view);
	webkit_settings_set_media_playback_requires_user_gesture(settings, FALSE);
	webkit_settings_set_allow_file_access_from_file_urls(settings, TRUE);

	if (env::dev) {
		webkit_settings_set_enable_developer_extras(settings, TRUE);
		WebKitWebInspector *inspector = webkit_web_view_get_inspector(web_view);
		webkit_web_inspector_show(inspector);
	}
}

int main(int argc, char **argv) {
	if (pipe(backPipe) == -1 || pipe(forthPipe) == -1) return -1;

	std::string appDir = getAppDir();
	std::string nodePath = findNode(appDir);

	if (!nodePath.empty()) {
		pid_t pid = fork();
		if (pid == -1) return -1;
		if (pid == 0) {
			std::string backendPath = appDir + "/usr/bin/backend/index.js";
			execlp(nodePath.c_str(), nodePath.c_str(), backendPath.c_str(),
				std::to_string(forthPipe[0]).c_str(),
				std::to_string(backPipe[1]).c_str(),
				nullptr);
			std::cerr << "Failed to start backend" << std::endl;
			return -1;
		}
	} else {
		std::cerr << "Node.js not found, starting in frontend-only mode" << std::endl;
	}

	GtkApplication *app = gtk_application_new(env::id, G_APPLICATION_DEFAULT_FLAGS);
	g_signal_connect(app, "activate", G_CALLBACK(activate), &appDir);
	int status = g_application_run(G_APPLICATION(app), argc, argv);
	g_object_unref(app);
	return status;
}
