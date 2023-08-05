#! /bin/bash
#./pull_datasets.sh
#if ! [[ -f datasets/datasets.zip ]]
#then
#    echo "Datasets were not pulled".
#    echo "You can open script pull_datasets.sh manually and take commands from else part."
#    exit 1
#fi


# Root directory
ROOT_DIR=$(pwd)
# hash of last commit from core desbordante
SUPPORTED_SHA='d994703d1ee8d2656f7fa949dd8a8ded63d39bd1'

mkdir -p lib
cd lib

#if [[ ! -d 'Desbordante' ]]
#then
#    echo "Pulling main repository"
#    git clone 'https://github.com/Mstrutov/Desbordante.git'
#    cd Desbordante/
#    git checkout "$SUPPORTED_SHA"
#else
#    cd Desbordante/
#    CUR_SHA=$(git rev-parse HEAD)
#    if [[ $CUR_SHA != $SUPPORTED_SHA ]]
#    then
#      echo "The current commit ($CUR_SHA) does not match the maintained commit"
#      echo "(maintained SHA is '$SUPPORTED_SHA')"
#      echo "Checkout to commit '$SUPPORTED_SHA'"
#      git checkout "$SUPPORTED_SHA"
#      CUR_SHA=$(git rev-parse HEAD)
#      if [[ $CUR_SHA != $SUPPORTED_SHA ]]
#      then
#        echo "Cannot checkout to maintained commit" \
#             "Trying to pull needed commit"
#        git pull origin "$SUPPORTED_SHA"
#        git checkout "$SUPPORTED_SHA"
#        if [[ $CUR_SHA != $SUPPORTED_SHA ]]
#        then
#          echo "Cannot get maintained commit"
#        fi
#      else
#        echo "The current commit matches latest maintained commit (after checkout)"
#      fi
#    else
#      echo "The current commit matches latest maintained commit"
#    fi
#fi

cd "$ROOT_DIR"

docker build -t cpp-consumer -f=Dockerfile-cpp-consumer .
#mkdir -m777 volumes
#cd volumes/
#mkdir -m777 -p data/kafka data/zk data/grafana logs/kafka logs/zk uploads postgres-data datasets results
#cd ..
#unzip datasets/datasets.zip -d volumes/datasets/
#cp tests/input_data/* volumes/datasets/
#docker-compose build
#if ! [[ -f ".env" ]]
#then
#    cp .env.example .env
#    echo "PWD=$PWD" >> .env
#fi
