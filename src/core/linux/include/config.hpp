#pragma once

#include <fstream>
#include <nlohmann/json.hpp>
#include <string>
#include <unistd.h>

nlohmann::json& getConfig(const std::string& name = "webnative.json");
std::string getAppDir();
std::string findNode(const std::string &appDir);
