#include "iexecutor.h"

namespace process {
bool IExecutor::LoadData(db::DataBase const& db, db::ParamsLoader& loader,
                         BaseConfig const& c) const {
    db::Select s{.select = {"*"},
                 .from = '"' + c.type + "TasksConfig\"",
                 .conditions = {{R"("taskID")", c.taskID}}};
    pqxx::result res = db.Query(s);

    if (res.empty()) {
        LOG(ERROR) << "FDTaskConfig with taskID '" << c.taskID << "' not found";
        return false;
    }
    pqxx::row const& configRow = res.front();

    for (const auto& col : configRow) {
        LOG(DEBUG) << "--" << col.name() << " " << col.c_str();
    }

    return InternalLoadData(db, loader, c, configRow);
}

bool IExecutor::Execute(db::DataBase const& db, std::string const& taskID) {
    try {
        auto exec_thread = std::async(std::launch::async, [this]() { return InternalExecute(); });

        std::future_status status;
        do {
            status = exec_thread.wait_for(std::chrono::seconds(0));
            if (status == std::future_status::ready) {
                UpdateProgress(db, taskID);
                db::Update update{.set = {{R"("elapsedTime")", std::to_string(exec_thread.get())},
                                          {R"("progress")", "100"}},
                                  .table = R"("TasksState")",
                                  .conditions = {{R"("taskID")", taskID}}};
                db.Query(update);

            } else if (status == std::future_status::timeout) {
                if (HasProgress()) {
                    UpdateProgress(db, taskID);
                }
            } else {
                throw std::runtime_error("Main thread: unknown future_status");
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        } while (status != std::future_status::ready);
        return true;
    } catch (std::exception const& e) {
        return false;
    }
}
}  // namespace process
