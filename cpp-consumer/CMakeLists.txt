set(BINARY ${CMAKE_PROJECT_NAME})

file(GLOB_RECURSE lib_sources "*/*.h*" "*/*.cpp*" "*/*.cc*")

# add_library(${BINARY}_consumer_libs STATIC ${lib_sources})

# if (SAFE_VERTICAL_HASHING)
#     target_compile_definitions(${BINARY}_consumer_libs PUBLIC SAFE_VERTICAL_HASHING)
# endif(SAFE_VERTICAL_HASHING)

set(run_sources "main.cpp")

set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)
find_library(PQXX_LIB pqxx)

add_executable(${BINARY}_cpp_consumer ${run_sources})

target_link_libraries(${BINARY}_cpp_consumer PUBLIC ${CMAKE_PROJECT_NAME}_lib ${PQXX_LIB} Boost::thread pthread)
target_link_libraries(${BINARY}_cpp_consumer LINK_PUBLIC ${Boost_LIBRARIES} Threads::Threads)
