#include <algorithm>
#include <stdexcept>

#include <easylogging++.h>

#include "process/task_processor.h"

INITIALIZE_EASYLOGGINGPP

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
    el::Loggers::configureFromGlobal("logging.conf");

    std::string const& taskID = argv[1];
    LOG(INFO) << "Received taskID '" << taskID << "'";
#define DEV 0
#if DEV
    db::DataBase db{{.host = "0.0.0.0",
                     .port = 5432,
                     .user = "postgres",
                     .password = "root",
                     .dbname = "desbordante"}};
#else
    std::string host = std::getenv("POSTGRES_HOST");
    std::string port = std::getenv("POSTGRES_PORT");
    std::string user = std::getenv("POSTGRES_USER");
    std::string password = std::getenv("POSTGRES_PASSWORD");
    std::string dbname = std::getenv("POSTGRES_DBNAME");

    db::DataBase db{{.host = host,
                     .port = std::stoi(port),
                     .user = user,
                     .password = password,
                     .dbname = dbname}};
#endif

    TaskProcessor p(db);
    p.Process(taskID);

    return 0;
}
