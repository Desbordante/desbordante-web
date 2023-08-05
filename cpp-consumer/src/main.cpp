//#include <iostream>
//#include <stdexcept>
//
//#include <boost/program_options.hpp>
#include <easylogging++.h>

//#include "algorithms/algo_factory.h"
//#include "util/config/all_options.h"
//#include "util/config/enum_to_available_values.h"

INITIALIZE_EASYLOGGINGPP

#if 0
namespace {
constexpr auto kHelp = "help";
constexpr auto kAlgorithm = "algorithm";
constexpr auto kDHelp = "print the help message and exit";

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

int main(int argc, char const* argv[]) {
    el::Loggers::configureFromGlobal("target/logging.conf");
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

    //    el::Loggers::configureFromGlobal("logging.conf");

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
