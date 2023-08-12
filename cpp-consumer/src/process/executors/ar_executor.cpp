#include "ar_executor.h"

namespace process {

std::string ToCompactString(model::ArIDs const& ar) {
    std::string result;
    std::stringstream stream;
    stream << std::fixed << std::setprecision(2) << ar.confidence;
    result.append(stream.str());
    result.append(":");
    for (auto const& item_id : ar.left) {
        result.append(std::to_string(item_id));
        result.append(",");
    }
    result.erase(result.size() - 1, 1);
    result.append(":");
    for (auto const& item_id : ar.right) {
        result.append(std::to_string(item_id));
        result.append(",");
    }
    result.erase(result.size() - 1, 1);
    return result;
}

std::string GetCompactRules(const std::list<model::ArIDs>& ars) {
    std::vector<std::string> compact_deps;
    for (const auto& ar : ars) {
        compact_deps.push_back(ToCompactString(ar));
    }
    return boost::join(compact_deps, ";");
}

static bool LoadFileFormat(db::DataBase const& db, db::ParamsLoader& loader, BaseConfig const& c) {
    using namespace config::names;

    db::Select s{.select = {R"("hasTid"::int as "hasTidInt")", "*"},
                 .from = R"("FilesFormat")",
                 .conditions = {{R"("fileID")", c.fileID}}};

    pqxx::result res = db.Query(s);
    if (res.empty()) {
        LOG(ERROR) << "FileFormat for file with fileID '" << c.fileID << "' not found";
        return false;
    }
    pqxx::row row = res.front();

    std::string inputFormat = res.front()[R"("inputFormat")"].as<std::string>();
    if (inputFormat == "SINGULAR") {
        LOG(ERROR) << "SINGULAR transaction datasets not supported (in cpp-consumer)";
        return false;
    }

    return loader.SetOptions(
            row, {{R"("inputFormat")", kInputFormat}, {R"("hasTidInt")", kFirstColumnTId}});
}

bool ARExecutor::InternalLoadData(db::DataBase const& db, db::ParamsLoader& loader,
                                  BaseConfig const& c, pqxx::row const& row) const {
    using namespace config::names;

    if (!LoadFileFormat(db, loader, c)) {
        LOG(ERROR) << "Cannot load file format info";
        return false;
    }

    return loader.SetOptions(row, {{R"("minSupportAR")", kMinimumSupport},
                                   {R"("minConfidence")", kMinimumConfidence}});
}

bool ARExecutor::SaveResults(db::DataBase const& db, BaseConfig const& c) const {
    const auto& algo = GetAlgoAs<algos::ARAlgorithm>();

    const std::list<model::ArIDs>& rules = algo.GetArIDsList();

    std::string depsStr = GetCompactRules(rules);
    std::string depsAmountStr = std::to_string(rules.size());
    std::string itemNames = boost::join(algo.GetItemNamesVector(), ",");

    db::Update u{.set = {{R"("deps")", depsStr},
                         {R"("depsAmount")", depsAmountStr},
                         {R"("valueDictionary")", itemNames}},
                 .table = '"' + c.type + R"(TasksResult")",
                 .conditions = {{R"("taskID")", c.taskID}}};
    db.TransactionQuery(u);
    return true;
}

}  // namespace process
