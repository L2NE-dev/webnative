cmake_minimum_required(VERSION 3.15)
project(webnative)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/dist)

find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK REQUIRED gtk4)
pkg_check_modules(WEBKIT REQUIRED webkitgtk-6.0)

add_executable(linux linux.cpp)

target_include_directories(linux PRIVATE
	${GTK_INCLUDE_DIRS}
	${WEBKIT_INCLUDE_DIRS}
)

target_link_libraries(linux PRIVATE
	${GTK_LIBRARIES}
	${WEBKIT_LIBRARIES}
)

target_compile_options(linux PRIVATE
	${GTK_CFLAGS_OTHER}
	${WEBKIT_CFLAGS_OTHER}
)