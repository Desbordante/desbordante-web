usage() {
cat << EOF  
Usage: ./build.sh [-c|-consumer] [-h|--help]

-h,     -help,          Display help

-c,     --consumer      Enable consumer compilation

EOF
}

PREFIX=""
POSTFIX="-DCMAKE_BUILD_TYPE=RELEASE"

for i in "$@"
    do
    case $i in
        -c|--consumer) # Enable consumer compile
            PREFIX="-D ENABLE_CONSUMER_COMPILE=ON"
            ;;
        -h|--help|*) # Display help.
            usage
            exit 0
            ;;
    esac
done

mkdir lib
cd lib
git clone https://github.com/google/googletest/ --branch release-1.10.0
git clone https://github.com/amrayn/easyloggingpp/ --branch v9.97.0
git clone https://github.com/aantron/better-enums.git --branch 0.11.3
cd ..
mkdir build
cd build
rm CMakeCache.txt
cmake $PREFIX .. $POSTFIX
make
