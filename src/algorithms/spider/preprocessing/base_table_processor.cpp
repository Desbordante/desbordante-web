#include "base_table_processor.h"

namespace algos::ind::preproc {

void BaseTableProcessor::Execute() {
    auto insert_time = std::chrono::system_clock::now();
    InitAdditionalChunkInfo(buffer_.GetCur(), buffer_.GetCur());
    cur_row_ = 0;
    while (stream_.HasNextRow()) {
        cur_row_++;
        auto row = stream_.GetNextRow();
        if (row.size() != GetHeaderSize()) {
            std::cout << "skip\n";
            continue;
        }
        ProcessRow(row);
    }

    FinalSpill();

    auto inserting_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - insert_time);
    LOG(INFO) << "Inserting: " << inserting_time.count();
    writer_.MergeFiles();

}

}  // namespace algos::ind::preproc
