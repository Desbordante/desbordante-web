#pragma once

#include <string>
#include <vector>

#include <boost/program_options.hpp>

#include "algorithms/options/descriptions.h"
#include "algorithms/options/names.h"
#include "descriptions.h"
#include "names.h"

namespace algos::config{

namespace inner {

static auto getExecutorOptions() {
    namespace po = boost::program_options;
    namespace onam = algos::config::names;
    namespace desc = algos::config::descriptions;

    po::options_description executor_options("Executor-specific options");
    executor_options.add_options()
            (onam::kFileID, po::value<std::string>()->required(), desc::kDFileID)
            (onam::kTaskID, po::value<std::string>()->required(), desc::kDTaskID)
            (onam::kType, po::value<std::string>()->required(), desc::kDType)
            ;
    return executor_options;
}

static auto getSpecificAlgoOptions() {
    namespace po = boost::program_options;
    namespace onam = algos::config::names;
    namespace desc = algos::config::descriptions;

    po::options_description typo_cluster_options("TypoCluster options");
    typo_cluster_options.add_options()
            (onam::kTypoFD, po::value<std::vector<unsigned int>>()->multitoken(), desc::kDTypoFD)
            (onam::kParentTaskID, po::value<std::string>(), desc::kDParentTaskID)
            (onam::kClusterID, po::value<unsigned>(), desc::kDClusterID)
            ;
    po::options_description algo_options("Allowed options");
    algo_options.add(typo_cluster_options);
    return algo_options;
};

}  // namespace inner

static auto executor_options = inner::getExecutorOptions();
static auto specific_algo_options = inner::getSpecificAlgoOptions();

}  // namespace algos::config
