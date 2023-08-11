cmake_minimum_required(VERSION 3.10)
project(Desbordante)

#set(CMAKE_PROJECT_NAME DesbordanteConsumer)
set(CMAKE_CXX_STANDARD 17)
#set(CMAKE_VERBOSE_MAKEFILE ON)

#option(CMAKE_BUILD_TYPE "Build type" Debug)
option(COMPILE_TESTS "Build tests" OFF)
option(UNPACK_DATASETS "Unpack datasets" OFF)
option(ASAN "Enable sanitizer" OFF)
#option(DESBORDANTE_SOURCE_DIR "Source directory for Desbordante")

set(COMPILE_TESTS ON)
set(UNPACK_DATASETS ON)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif(NOT CMAKE_BUILD_TYPE)

set(DESBORDANTE_SOURCE_DIR "${CMAKE_SOURCE_DIR}/lib/Desbordante")
message("msg '${DESBORDANTE_SOURCE_DIR}'")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY  "${CMAKE_BINARY_DIR}/target")



# -DELPP_THREAD_SAFE -- for easylogging++ thread safety
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

#set(PQXX_LIB /usr/local/lib/libpqxx.a)
#set(PQXX_LIB /usr/local/lib/libpqxx.a)
find_library(PQXX_LIB pqxx)
message(${PQXX_LIB})

file(GLOB_RECURSE consumer_sources "src/*.h" "src/*.cpp")

set(CONSUMER_NAME "${CMAKE_PROJECT_NAME}_cpp_consumer")

add_executable("${CONSUMER_NAME}" src/main.cpp ${consumer_sources})
target_link_libraries("${CONSUMER_NAME}" PRIVATE ${CMAKE_PROJECT_NAME}_lib ${PQXX_LIB} pq)

#set(THREADS_PREFER_PTHREAD_FLAG ON)
#find_package(Threads REQUIRED)

#set(Boost_USE_STATIC_LIBS ON)
#find_package(Boost 1.72.0 REQUIRED COMPONENTS container program_options thread)

#find_library(PQXX_LIB pqxx)
# ${consumer_sources}
#target_link_libraries(consumer PRIVATE Desbordante_lib ${PQXX_LIB} pq)
#target_link_libraries(consumer LINK_PUBLIC ${Boost_LIBRARIES} Threads::Threads)
