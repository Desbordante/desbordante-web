#! /bin/bash

START_DIR=$(pwd)
CORE_DIR="cpp-consumer/lib/Desbordante/"

git submodule update --init

cd "${CORE_DIR}"
./pull_datasets.sh
if ! [[ -f datasets/datasets.zip ]]
then
    echo "Datasets were not pulled".
    echo "You can open script pull_datasets.sh manually and take commands from else part."
    exit 1
fi

cd "${START_DIR}"

docker build -t cpp-consumer -f=cpp-consumer/Dockerfile-cpp-consumer .
mkdir -m777 -p volumes
cd volumes/
mkdir -m777 -p data/kafka data/zk data/grafana logs/kafka logs/zk uploads postgres-data datasets results cms-data cms-uploads
cd ..
unzip datasets/datasets.zip -d volumes/datasets/
cp ${CORE_DIR}/test_input_data/* volumes/datasets/
docker compose build
if ! [[ -f ".env" ]]
then
    cp .env.example .env
    echo "PWD=$PWD" >> .env
fi
