#!/bin/bash

PREFIX=""
JOBS_OPTION="-j4" # default value

for i in "$@"
    do
    case $i in
        -d) # Enable development build
            PREFIX="${PREFIX} -DDEV=ON "
            ;;
        -j*|--jobs=*) # Allow N jobs at once
            JOBS_OPTION=$i
            ;;
    esac
done

mkdir -p build
cd build && cmake $PREFIX .. && make $JOBS_OPTION
