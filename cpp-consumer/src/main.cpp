#include <filesystem>
#include <iostream>
#include <stdexcept>

#include <boost/program_options.hpp>
#include <easylogging++.h>

#include "util/config/names.h"

#if 0
#include "algorithms/algo_factory.h"
#include "util/config/all_options.h"
#include "util/config/enum_to_available_values.h"
#endif

#include "data/database.h"

INITIALIZE_EASYLOGGINGPP

#if 0
namespace {
constexpr auto kHelp = "help";
constexpr auto kAlgorithm = "algorithm";
constexpr auto kDHelp = "print the help message and exit";

#if 0
boost::program_options::options_description InfoOptions() {
    namespace po = boost::program_options;
    po::options_description info_options("Desbordante information options");
    info_options.add_options()(kHelp, kDHelp)
            // --version, if needed, goes here too
            ;
    return info_options;
}
}  // namespace
#endif

#endif

struct BaseConfig {
    std::string fileID;
    std::string taskID;
    std::string algorithmName;
    std::string type;

public:
    static std::optional<BaseConfig> loadConfig(db::DataBase const& db, std::string const& taskID) {
        db::Select s{.select = {"*"},
                     .from = R"("TasksConfig")",
                     .conditions = {{R"("taskID")", taskID}}};
        pqxx::result res = db.Query(s);

        if (res.empty()) {
            LOG(ERROR) << "TaskConfig with taskID '" << taskID << "' not found";
            return std::nullopt;
        }

        pqxx::row const& configRow = res.front();

        return BaseConfig{
                .fileID = configRow[R"("fileID")"].c_str(),
                .taskID = taskID,
                .algorithmName = configRow[R"("algorithmName")"].c_str(),
                .type = configRow[R"("type")"].c_str(),
        };
    }
};

struct FileInfo {
public:
    std::string fileID;
    bool hasHeader;
    std::string separator;
    std::filesystem::path path;

    static std::optional<FileInfo> loadFileInfo(db::DataBase const& db, std::string const& fileID) {
        db::Select s{
                .select = {"*"}, .from = R"("FilesInfo")", .conditions = {{R"("fileID")", fileID}}};
        pqxx::result res = db.Query(s);
        if (res.empty()) {
            LOG(ERROR) << "File with fileID '" << fileID << "' not found";
            return std::nullopt;
        }

        pqxx::row const& fileRow = res.front();
        return FileInfo{.fileID = fileID,
                        .hasHeader = fileRow[R"("hasHeader")"].get<bool>().value(),
                        .separator = fileRow[R"("delimiter")"].c_str(),
                        .path = fileRow[R"("path")"].c_str()};
    }
};

class SpecificConfig {
    std::map<std::string, std::string> options;

    virtual bool internalLoadData(db::DataBase const& db, BaseConfig const& c,
                                  pqxx::row const& row) = 0;

protected:
    void insert(pqxx::row const& row, std::string const& name, std::string alias = "") {
        if (alias.empty()) {
            alias = name;
        }
        options.emplace(alias, row[name].c_str());
        LOG(INFO) << "set " << alias << " " << row[name].c_str();
    }

public:
    bool loadData(db::DataBase const& db, BaseConfig const& c) {
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

        return internalLoadData(db, c, configRow);
    }
    virtual ~SpecificConfig() = default;
};

class FDSpecificConfig final : public SpecificConfig {
    bool internalLoadData(db::DataBase const& /*db*/, BaseConfig const& /*c*/,
                          pqxx::row const& row) final {
        using namespace util::config::names;
        insert(row, R"("errorThreshold")", kError);
        insert(row, R"("maxLHS")", kMaximumLhs);
        insert(row, R"("threadsCount")", kThreads);
        return true;
    }
};

struct TaskConfig {
public:
    FileInfo file;
    BaseConfig baseConfig;
    std::unique_ptr<SpecificConfig> specificConfig;

    static std::unique_ptr<SpecificConfig> createSpecificConfig(std::string const& type) {
        if (type == "FD") {
            return std::make_unique<FDSpecificConfig>();
        }
        return nullptr;
    }

    static std::optional<TaskConfig> loadConfig(db::DataBase const& db, std::string const& taskID) {
        std::optional<BaseConfig> baseConfigOpt = BaseConfig::loadConfig(db, taskID);
        if (!baseConfigOpt.has_value()) {
            return std::nullopt;
        }

        BaseConfig baseConfig = baseConfigOpt.value();

        std::optional<FileInfo> fileInfoOpt = FileInfo::loadFileInfo(db, baseConfig.fileID);
        if (!fileInfoOpt.has_value()) {
            return std::nullopt;
        }
        std::unique_ptr<SpecificConfig> specificConfig =
                TaskConfig::createSpecificConfig(baseConfig.type);

        if (!specificConfig->loadData(db, baseConfig)) {
            return std::nullopt;
        }

        return TaskConfig{.file = fileInfoOpt.value(),
                          .baseConfig = std::move(baseConfig),
                          .specificConfig = std::move(specificConfig)};
    }
};

int execute(std::string const& taskID) {
    LOG(INFO) << "Received taskID '" << taskID;

    db::DataBase db{{.host = "localhost",
                     .port = 5432,
                     .user = "postgres",
                     .password = "root",
                     .dbname = "desbordante"}};

    std::optional<TaskConfig> configOpt = TaskConfig::loadConfig(db, taskID);

    if (!configOpt.has_value()) {
        LOG(ERROR) << "Config wasn't loaded";
        return 1;
    }

    //    TaskConfig const& config = configOpt.value();

    return 0;
}

int main(int argc, char const* argv[]) {
    if (argc != 2) {
        return 1;
    }
    el::Loggers::configureFromGlobal("target/logging.conf");
    return execute(argv[1]);
#if 0
    namespace po = boost::program_options;
    using namespace util::config;

    std::string algorithm;
    std::string const algo_desc = "algorithm to use for data profiling\n" +
                                  util::EnumToAvailableValues<algos::AlgorithmType>() + " + [ac]";
    auto general_options = GeneralOptions();

    // clang-format off
    general_options.add_options()
            (kAlgorithm, po::value<std::string>(&algorithm)->required(), algo_desc.c_str());
    // clang-format on

    auto all_options = InfoOptions().add(general_options).add(AlgoOptions());
    po::variables_map vm;
    try {
        po::store(po::parse_command_line(argc, argv, all_options), vm);
    } catch (po::error& e) {
        std::cout << e.what() << std::endl;
        return 1;
    }
    if (vm.count(kHelp)) {
        std::cout << all_options << std::endl;
        return 0;
    }
    try {
        po::notify(vm);
    } catch (po::error& e) {
        std::cout << e.what() << std::endl;
        return 1;
    }

    el::Loggers::configureFromGlobal("target/logging.conf");

    std::unique_ptr<algos::Algorithm> algorithm_instance;
    try {
        algorithm_instance = algos::CreateAlgorithm(algorithm, vm);
    } catch (std::exception& e) {
        std::cout << e.what() << std::endl;
        return 1;
    }
    try {
        unsigned long long elapsed_time = algorithm_instance->Execute();
        std::cout << "> ELAPSED TIME: " << elapsed_time << std::endl;
    } catch (std::runtime_error& e) {
        std::cout << e.what() << std::endl;
        return 1;
    }
#endif
    return 0;
}

// enum class AnswerEnumType {
//     TASK_SUCCESSFULLY_PROCESSED = 0, TASK_CRASHED_STATUS_UPDATED = 1,
//     TASK_CRASHED_WITHOUT_STATUS_UPDATING = 2, TASK_NOT_FOUND = 3
// };

// int execute(int argc, char const* argv[]) {
//     namespace po = boost::program_options;
//     using namespace util::config;
//
//     std::string algorithm;
//     std::string const algo_desc = "algorithm to use for data profiling\n" +
//                                   util::EnumToAvailableValues<algos::AlgorithmType>() + " +
//                                   [ac]";
//     auto general_options = GeneralOptions();
//
//     // clang-format off
//     general_options.add_options()
//             (kAlgorithm, po::value<std::string>(&algorithm)->required(), algo_desc.c_str());
//     // clang-format on
//
//     auto all_options = general_options.add(AlgoOptions());
//     po::variables_map vm;
//     try {
//         po::store(po::parse_command_line(argc, argv, all_options), vm);
//     } catch (po::error& e) {
//         std::cout << e.what() << std::endl;
//         return 1;
//     }
//     if (vm.count(kHelp)) {
//         std::cout << all_options << std::endl;
//         return 0;
//     }
//     try {
//         po::notify(vm);
//     } catch (po::error& e) {
//         std::cout << e.what() << std::endl;
//         return 1;
//     }
//
//     el::Loggers::configureFromGlobal("logging.conf");
//
//     std::unique_ptr<algos::Algorithm> algorithm_instance;
//     try {
//         algorithm_instance = algos::CreateAlgorithm(algorithm, vm);
//     } catch (std::exception& e) {
//         std::cout << e.what() << std::endl;
//         return 1;
//     }
//     try {
//         unsigned long long elapsed_time = algorithm_instance->Execute();
//         std::cout << "> ELAPSED TIME: " << elapsed_time << std::endl;
//     } catch (std::runtime_error& e) {
//         std::cout << e.what() << std::endl;
//         return 1;
//     }
//
//     return 0;
// }

// int main(int argc, const char* argv[]) {
//     execute(argc, argv);
//     using namespace db;
//     if (argc != 2) {
//         throw std::runtime_error("Expected 1 input argument [taskID]");
//         }
//     el::Loggers::configureFromGlobal("logging.conf");

//    DataBase db{{.host = "0.0.0.0",
//                 .port = 5432,
//                 .user = "postgres",
//                 .password = "root",
//                 .dbname = "desbordante"}};
//    pqxx::result res = db.Query(
//            R"(select * from "FDTasksConfig" where
//            "taskID"='f38142e3-9e99-409e-8264-15334693d84d';)");
//
//    for (pqxx::row const& row : res) {
//        for (auto const& item : row) {
//            std::cout << item.name() << " " << item.c_str() << "\n";
//        }
//        //        std::cout << row["\"taskID\""].as<std::string>() << "\n";
//    }

//    try {
//        el::Loggers::configureFromGlobal("logging.conf");
//        std::string task_id = argv[1];
//        LOG(INFO) << "Create manager";
//        auto manager = std::make_shared<DesbordanteDbManager>(DBConnection(), BaseTables(),
//        SpecificTables()); LOG(INFO) << "Manager created, process msg"; return
//        static_cast<int>(ProcessMsg(task_id, manager));
//    } catch (const std::exception& e) {
//        std::cerr << "% Unexpected exception caught: " << e.what() << '\n';
//        return static_cast<int>(AnswerEnumType::TASK_CRASHED_WITHOUT_STATUS_UPDATING);
//    }
//}
