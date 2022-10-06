#include "StatProcessor.h"

namespace consumer {

void StatProcessor::Execute() {
    try {
        const auto& stats = algo_->GetAllStats();
        for(unsigned i = 0; i < stats.size(); ++i) {
            LOG(INFO) << "Update params for stats result";
            std::string queryUpdateStats = "UPDATE \"Statistic\" SET " + stats[i].toDBUpdate() + " WHERE \"fileID\" = '"
                + task_->GetParam("fileID") + "' AND \"columnIndex\" = '" + std::to_string(i) + "'";
            std::string queryUpdateFileInfo = "UPDATE \"FilesInfo\" SET \"hasStats\" = 'true' WHERE \"fileID\" = '"
                + task_->GetParam("fileID") + "'";
            task_->db_manager_->SendBaseQuery(queryUpdateStats, "Update table Statistic " + queryUpdateStats);
            task_->db_manager_->SendBaseQuery(queryUpdateFileInfo, "Update table FileInfo " + queryUpdateFileInfo);
        }
        LOG(INFO) << "Stats was successfully calculated, results saved\n";
        return;
    } catch (std::runtime_error& e) {
        LOG(INFO) << "Error while executing " << e.what() << std::endl;
        throw e;
    }
}

}
