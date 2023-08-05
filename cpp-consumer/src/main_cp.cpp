#include <iostream>
#include <stdexcept>

#include <easylogging++.h>
#if 0
#include <boost/program_options.hpp>

#include "algorithms/algo_factory.h"
#include "util/config/all_options.h"
#include "util/config/enum_to_available_values.h"
#endif
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
#endif
    el::Loggers::configureFromGlobal("target/logging.conf");
#if 0
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
