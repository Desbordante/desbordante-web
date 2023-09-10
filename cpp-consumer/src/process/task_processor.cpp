#include "task_processor.h"

#include "algorithms/algo_factory.h"
#include "all_executors.h"
#include "config/all_options.h"
#include "data/params_loader.h"
#include "easylogging++.h"
#include "util/enum_to_available_values.h"

namespace process {

namespace {
constexpr auto kAlgorithm = "algorithm";
}  // namespace

static std::unique_ptr<algos::Algorithm> CreateAlgorithm(db::ParamsLoader::ParamsMap& params) {
    namespace po = boost::program_options;
    using namespace config;

    std::string algorithm;
    std::string const algo_desc = "algorithm to use for data profiling\n" +
                                  util::EnumToAvailableValues<algos::AlgorithmType>();
    auto general_options = GeneralOptions();

    // clang-format off
        general_options.add_options()
            (kAlgorithm, po::value<std::string>(&algorithm)->required(), algo_desc.c_str());
    // clang-format on

    auto all_options = general_options.add(AlgoOptions());
    po::variables_map vm;

    try {
        po::parsed_options parsed(&all_options);
        for (auto const& [name, values] : params) {
            std::stringstream ss;
            for (auto const& value : values) {
                ss << value << " ";
            }
            LOG(DEBUG) << "--" << name << " " << ss.str();
            parsed.options.emplace_back(name, values);
        }
        po::store(parsed, vm);
    } catch (po::error& e) {
        LOG(INFO) << e.what() << std::endl;
        return nullptr;
    }
    try {
        po::notify(vm);
    } catch (po::error& e) {
        LOG(INFO) << e.what() << std::endl;
        return nullptr;
    }

    std::unique_ptr<algos::Algorithm> algorithm_instance;
    try {
        return algos::CreateAlgorithm(algorithm, vm);
    } catch (std::exception& e) {
        LOG(INFO) << e.what() << std::endl;
        return nullptr;
    }
}

static std::unique_ptr<IExecutor> CreateExecutor(std::string const& type) {
    if (type == "AR") {
        return std::make_unique<ARExecutor>();
    } else if (type == "CFD") {
        return std::make_unique<CFDExecutor>();
    } else if (type == "FD") {
        return std::make_unique<FDExecutor>();
    } else if (type == "MFD") {
        return std::make_unique<MFDExecutor>();
    } else if (type == "Stats") {
        return std::make_unique<StatsExecutor>();
    }
    return nullptr;
}

bool TaskProcessor::LoadFileInfo() {
    using namespace config::names;

    std::string const& fileID = baseConfig_.fileID;

    db::Select s{.select = {R"("hasHeader"::int as "hasHeaderInt")", "*"},
                 .from = R"("FilesInfo")",
                 .conditions = {{R"("fileID")", fileID}}};
    pqxx::result res = db_.Query(s);
    if (res.empty()) {
        LOG(ERROR) << "File with fileID '" << fileID << "' not found";
        return false;
    }

    return loader_.SetOptions(res.front(), {{R"("hasHeaderInt")", kHasHeader},
                                            {R"("path")", kCsvPath},
                                            {R"("delimiter")", kSeparator}});
}
bool TaskProcessor::LoadBaseConfig(const std::string& taskID) {
    using namespace config::names;

    db::Select s{
            .select = {"*"}, .from = R"("TasksConfig")", .conditions = {{R"("taskID")", taskID}}};
    pqxx::result res = db_.Query(s);

    if (res.empty()) {
        LOG(INFO) << "TaskConfig with taskID '" << taskID << "' not found";
        return false;
    }

    pqxx::row const& configRow = res.front();
    baseConfig_ = BaseConfig{
            .fileID = configRow[R"("fileID")"].c_str(),
            .taskID = taskID,
            .algorithmName = configRow[R"("algorithmName")"].c_str(),
            .type = configRow[R"("type")"].c_str(),
    };
    return true;
}

bool TaskProcessor::Process(std::string const& taskID) {
    loader_.Reset();
    if (!LoadBaseConfig(taskID) || !LoadFileInfo()) {
        return false;
    }

    std::unique_ptr<IExecutor> executor = CreateExecutor(baseConfig_.type);

    if (!executor->LoadData(db_, loader_, baseConfig_)) {
        LOG(INFO) << "Cannot load data";
        return false;
    }

    std::string coreAlgoName = executor->ResolveAlgoType(baseConfig_.algorithmName)._to_string();
    if (!loader_.SetOption(kAlgorithm, coreAlgoName)) {
        return false;
    }
    executor->SetAlgo(CreateAlgorithm(loader_.GetParams()));
    executor->Execute(db_, baseConfig_.taskID);

    if (!executor->SaveResults(db_, baseConfig_)) {
        return false;
    }
    db::Update update{.set = {{R"("status")", "COMPLETED"}, {R"("isExecuted")", "true"}},
                      .table = R"("TasksState")",
                      .conditions = {{R"("taskID")", taskID}}};
    db_.Query(update);

    return true;
}

}  // namespace process
