#pragma once

#include "stdlib.h"
#include "stdio.h"
#include "string.h"
#include "sys/types.h"
#include "sys/sysinfo.h"
#include <sys/resource.h>
#include <iostream>
#include <malloc.h>
#include <fstream>
#include <vector>
#include <unistd.h>

//int parseLine(char* line){
//    // This assumes that a digit will be found and the line ends in " Kb".
//    int i = strlen(line);
//    const char* p = line;
//    while (*p <'0' || *p > '9') p++;
//    line[i-3] = '\0';
//    i = atoi(p);
//    return i;
//}
//
//
//
//
//int Vm(std::string const& name){ //Note: this value is in KB!
//    FILE* file = fopen("/proc/self/status", "r");
//    int result = -1;
//    char line[128];
//
//    while (fgets(line, 128, file) != NULL){
//        if (strncmp(line, std::string{name + ":"}.c_str(), name.size() + 1) == 0){
//            result = parseLine(line);
//            break;
//        }
//    }
//    fclose(file);
//    return result >> 10;
//}
//
//int VmSize(){
//    return Vm("VmSize");
//}
//int VmRSS(){
//    return Vm("VmRSS");
//}
//
//int VmPeak(){
//    return Vm("VmPeak");
//}
//
//void PrintProcStatus() {
//    std::ifstream from("/proc/self/status");
//    std::string line;
//    while (std::getline(from, line)) {
//        std::cout << line << std::endl;
//    }
//    from.close();
//}
//
//
//// Total Virtual Memory:
//
//
//void printTotalVirtualMemory() {
//    struct sysinfo memInfo;
//    sysinfo(&memInfo);
//    long long physMemUsed = memInfo.totalram - memInfo.freeram;
//    //Multiply in next statement to avoid int overflow on right hand side...
//    physMemUsed *= memInfo.mem_unit;
//    std::cout << (physMemUsed >> 20) << " mb" << std::endl;
//}
//
//void printMaxRSS() {
//    struct rusage usage;
//    getrusage(RUSAGE_SELF, &usage);
//    std::cout << "MaxRSS: " <<  (usage.ru_maxrss >> 10) << " mb" << std::endl;
//
//}
//
//void printMallinfo() {
//    auto info = mallinfo2();
//    std::cout << "Total non-mmapped bytes (arena): " << info.arena << '\n';
//    std::cout << "Number of free chunks (ordblks): " << info.ordblks << '\n';
//    std::cout << "Number of free fastbin blocks (smblks): " << info.smblks << '\n';
//    std::cout << "Number of mapped regions (hblks): " << info.hblks << '\n';
//    std::cout << "Bytes in mapped regions (hblkhd): " << info.hblkhd << '\n';
//    std::cout << "Max. total allocated space (usmblks): " << info.usmblks << '\n';
//    std::cout << "Free bytes held in fastbins (fsmblks): " << info.fsmblks << '\n';
//    std::cout << "Total allocated space (uordblks): " << info.uordblks << '\n';
//    std::cout << "Total free space (fordblks): " << info.fordblks << '\n';
//    std::cout << "Topmost releasable block size (keepcost): " << info.keepcost << '\n';
//}
//
//template <typename S>
//std::size_t calculateSetSizeInBytes(std::vector<S> const& columns) {
//    std::size_t result = sizeof(std::vector<S>);
//    for (auto const& col : columns) {
//        result += sizeof(S) + col.size() * sizeof(typename S::node_type);
//    }
//    return result;
//}

//void To(std::size_t value, std::string const& to = "mb") {
//    if (to == "mb") {
//        std::cout << (value >> 20);
//    } else if (to == "kb") {
//        std::cout << (value >> 10);
//    } else if (to == "gb") {
//        std::cout << (value >> 30);
//    } else {
//        std::cout << "unexpected ";
//    }
//    std::cout << " " << to << std::endl;
//}
//
//static std::size_t PAGE_SIZE = sysconf(_SC_PAGE_SIZE);
