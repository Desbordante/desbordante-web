#include <algorithm>
#include <stdexcept>

#include <easylogging++.h>

#include "process/task_processor.h"

INITIALIZE_EASYLOGGINGPP

#define DEV 0

#if 0
 enum class AnswerEnumType {
     TASK_SUCCESSFULLY_PROCESSED = 0, TASK_CRASHED_STATUS_UPDATED = 1,
     TASK_CRASHED_WITHOUT_STATUS_UPDATING = 2, TASK_NOT_FOUND = 3
 };
#endif

int main(int argc, char const* argv[]) {
    using namespace process;
    if (argc != 2) {
        LOG(ERROR) << "Expected 'taskID' as parameter";
        return 1;
    }

#if DEV
    std::string host = "0.0.0.0";
    std::string port = "5432";
    std::string user = "postgres";
    std::string password = "root";
    std::string dbname = "desbordante";

    el::Loggers::configureFromGlobal("build/target/logging.conf");
#else
    std::string host = std::getenv("POSTGRES_HOST");
    std::string port = std::getenv("POSTGRES_PORT");
    std::string user = std::getenv("POSTGRES_USER");
    std::string password = std::getenv("POSTGRES_PASSWORD");
    std::string dbname = std::getenv("POSTGRES_DBNAME");

    el::Loggers::configureFromGlobal("logging.conf");
#endif

    db::DataBase db{{.host = host,
                     .port = std::stoi(port),
                     .user = user,
                     .password = password,
                     .dbname = dbname}};

    TaskProcessor p(db);

    std::string const& taskID = argv[1];
    LOG(DEBUG) << "Received taskID '" << taskID << "'";
    p.Process(taskID);

    return 0;
}
