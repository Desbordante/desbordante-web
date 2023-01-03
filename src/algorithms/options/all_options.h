#pragma once

#include <string>
#include <vector>

#include <boost/program_options.hpp>

#include "algorithms/ar_algorithm_enums.h"
#include "algorithms/metric/enums.h"
#include "algorithms/options/descriptions.h"
#include "algorithms/options/names.h"
#include "algorithms/create_primitive.h"

namespace algos {

template <typename T>
void validate(boost::any& v, const std::vector<std::string>& values, T*, int) {
    namespace po = boost::program_options;

    const std::string& s = po::validators::get_single_string(values);
    try {
        v = boost::any(T::_from_string_nocase(s.c_str()));
    } catch (std::runtime_error& e) {
        throw po::validation_error(po::validation_error::invalid_option_value);
    }
}

namespace metric {

template <typename... Ts>
void validate(Ts&&... params) {
    return validate(std::forward<Ts>(params)...);
}

}  // namespace metric

namespace config {

namespace inner {

constexpr auto kHelp = "help";
constexpr auto kPrimitive = "primitive";
std::string const separator_opt = std::string(algos::config::names::kSeparator) + ",s";
std::string const kDPrimitive = "algorithm to use for data profiling\n" +
                                EnumToAvailableValues<algos::PrimitiveType>() + " + [ac]";

static auto getInfoOptions() {
    namespace po = boost::program_options;

    po::options_description info_options("Desbordante information options");
    info_options.add_options()(kHelp, "print the help message and exit")
            // --version, if needed, goes here too
            ;
    return info_options;
}

static auto getGeneralOptions() {
    namespace po = boost::program_options;
    namespace onam = ::algos::config::names;
    namespace desc = ::algos::config::descriptions;

    po::options_description general_options("General options");
    general_options.add_options()
            (kPrimitive, po::value<std::string>()->required(), kDPrimitive.c_str())
            (onam::kData, po::value<std::filesystem::path>()->required(), desc::kDData)
            (separator_opt.c_str(), po::value<char>()->default_value(','), desc::kDSeparator)
            (onam::kHasHeader, po::value<bool>()->default_value(true), desc::kDHasHeader)
            (onam::kEqualNulls, po::value<bool>(), desc::kDEqualNulls)
            (onam::kThreads, po::value<ushort>(), desc::kDThreads)
            ;
    return general_options;
}

static auto getAlgoOptions() {
    namespace po = boost::program_options;
    namespace onam = ::algos::config::names;
    namespace desc = ::algos::config::descriptions;

    /*Options for algebraic constraints algorithm*/
//    char bin_operation = '+';
//    double fuzziness = 0.15;
//    double p_fuzz = 0.9;
//    double weight = 0.05;
//    size_t bumps_limit = 5;
//    size_t iterations_limit = 10;
//    std::string pairing_rule = "trivial";

    po::options_description fd_options("FD options");
    fd_options.add_options()
            (onam::kError, po::value<double>(), desc::kDError)
            (onam::kMaximumLhs, po::value<unsigned int>(), desc::kDMaximumLhs)
            (onam::kSeed, po::value<int>(), desc::kDSeed)
            ;

    po::options_description typo_options("Typo mining options");
    typo_options.add_options()
            (onam::kRatio, po::value<double>(), desc::kDRatio)
            (onam::kRadius, po::value<double>(), desc::kDRadius)
            (onam::kApproximateAlgorithm, po::value<algos::PrimitiveType>(),
             desc::kDApproximateAlgorithm)
            (onam::kPreciseAlgorithm, po::value<algos::PrimitiveType>(), desc::kDPreciseAlgorithm)
            ;

    po::options_description ar_options("AR options");
    ar_options.add_options()
            (onam::kMinimumSupport, po::value<double>(), desc::kDMinimumSupport)
            (onam::kMinimumConfidence, po::value<double>(), desc::kDMinimumConfidence)
            (onam::kInputFormat, po::value<algos::InputFormat>(), desc::kDInputFormat)
            ;

    po::options_description ar_singular_options("AR \"singular\" input format options");
    ar_singular_options.add_options()
            (onam::kTIdColumnIndex, po::value<unsigned>(), desc::kDTIdColumnIndex)
            (onam::kItemColumnIndex, po::value<unsigned>(), desc::kDItemColumnIndex)
            ;

    po::options_description ar_tabular_options("AR \"tabular\" input format options");
    ar_tabular_options.add_options()
            (onam::kFirstColumnTId, po::value<bool>()->default_value(true), desc::kDFirstColumnTId)
            ;

    ar_options.add(ar_singular_options).add(ar_tabular_options);

    po::options_description mfd_options("MFD options");
    mfd_options.add_options()
            (onam::kMetric, po::value<algos::metric::Metric>(), desc::kDMetric)
            (onam::kMetricAlgorithm, po::value<algos::metric::MetricAlgo>(),
             desc::kDMetricAlgorithm)
            (onam::kLhsIndices, po::value<std::vector<unsigned int>>()->multitoken(),
             desc::kDLhsIndices)
            (onam::kRhsIndices, po::value<std::vector<unsigned int>>()->multitoken(),
             desc::kDRhsIndices)
            (onam::kParameter, po::value<long double>(), desc::kDParameter)
            (onam::kDistFromNullIsInfinity, po::bool_switch(), desc::kDDistFromNullIsInfinity)
            ;

    po::options_description cosine_options("Cosine metric options");
    cosine_options.add_options()
            (onam::kQGramLength, po::value<unsigned int>(), desc::kDQGramLength)
            ;

    mfd_options.add(cosine_options);

//    po::options_description ac_options("AC options");
//    ac_options.add_options()
//            (onam::kBinaryOperation, po::value<char>(&bin_operation)->default_value(bin_operation),
//             "one of available operations: /, *, +, - ")
//            (onam::kFuzziness, po::value<double>(&fuzziness)->default_value(0.15),
//             "fraction of exceptional records")
//            (onam::kFuzzinessProbability, po::value<double>(&p_fuzz)->default_value(p_fuzz),
//             "probability, the fraction of exceptional records that lie outside the "
//             "bump intervals is at most Fuzziness")
//             (onam::kWeight, po::value<double>(&weight)->default_value(weight),
//              "value between 0 and 1. Closer to 0 - many short intervals. "
//              "Closer to 1 - small number of long intervals")
//             (onam::kBumpsLimit, po::value<size_t>(&bumps_limit)->default_value(bumps_limit),
//              "max considered intervals amount. Pass 0 to remove limit")
//             (onam::kIterationsLimit,
//              po::value<size_t>(&iterations_limit)->default_value(iterations_limit),
//              "limit for iterations of sampling")
//             (onam::kPairingRule,
//              po::value<std::string>(&pairing_rule)->default_value(pairing_rule),
//              "one of available pairing rules: trivial")
//            ;

    po::options_description algo_options("Allowed options");
    algo_options.add(fd_options).add(mfd_options).add(ar_options)
//            .add(ac_options)
            .add(typo_options);
    return algo_options;
}

}  // namespace inner

static auto info_options = inner::getInfoOptions();
static auto general_options = inner::getGeneralOptions();
static auto algo_options = inner::getAlgoOptions();

}  // namespace config

}  // namespace algos