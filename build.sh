usage() {
cat << EOF
Usage: ./build.sh [-h|--help]

-h,     -help,          Display help

EOF
}

POSTFIX="-DCMAKE_BUILD_TYPE=RELEASE -DSAFE_VERTICAL_HASHING=ON"

for i in "$@"
    do
    case $i in
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
cmake .. $POSTFIX
make
