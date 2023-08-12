cmake_minimum_required(VERSION 3.10)
project(Desbordante)

set(CMAKE_CXX_STANDARD 17)

option(COMPILE_TESTS "Build tests" OFF)
option(UNPACK_DATASETS "Unpack datasets" OFF)
option(ASAN "Enable sanitizer" OFF)

set(COMPILE_TESTS OFF)
set(UNPACK_DATASETS OFF)
set(CMAKE_BUILD_TYPE Release)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif(NOT CMAKE_BUILD_TYPE)

set(DESBORDANTE_SOURCE_DIR "${CMAKE_SOURCE_DIR}/lib/Desbordante")
message("msg '${DESBORDANTE_SOURCE_DIR}'")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY  "${CMAKE_BINARY_DIR}/target")

add_compile_options("$<$<CONFIG:Debug>:-O0;-DELPP_THREAD_SAFE;-g;-Wall;-Wextra;-Werror;-fno-omit-frame-pointer>")
if (ASAN)
    add_compile_options("$<$<CONFIG:Debug>:-fsanitize=address>")
    add_link_options("$<$<CONFIG:Debug>:-fsanitize=address>")
endif()
add_compile_options("$<$<CONFIG:Release>:-O3;-DELPP_THREAD_SAFE>")

MACRO(HEADER_DIRECTORIES return_list)
    FILE(GLOB_RECURSE new_list *.h)
    SET(dir_list "")
    FOREACH(file_path ${new_list})
        GET_FILENAME_COMPONENT(dir_path ${file_path} PATH)
        SET(dir_list ${dir_list} ${dir_path})
    ENDFOREACH()
    LIST(REMOVE_DUPLICATES dir_list)
    SET(${return_list} ${dir_list})
ENDMACRO()

HEADER_DIRECTORIES(header_dir_list)

list(LENGTH header_dir_list header_dir_list_count)

add_subdirectory(lib/Desbordante)

include_directories(
        lib/Desbordante/src/core
        src
        ${header_dir_list}
)

find_library(PQXX_LIB pqxx)

file(GLOB_RECURSE consumer_sources "src/*.h" "src/*.cpp")

set(CONSUMER_NAME "${CMAKE_PROJECT_NAME}_cpp_consumer")

add_executable("${CONSUMER_NAME}" src/main.cpp ${consumer_sources})
target_link_libraries("${CONSUMER_NAME}" PRIVATE ${CMAKE_PROJECT_NAME}_lib ${PQXX_LIB} pq)
