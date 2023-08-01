#! /bin/bash
./pull_datasets.sh
if ! [[ -f datasets/datasets.zip ]]
then
    echo "Datasets were not pulled".
    echo You can open script pull_datasets.sh manually and take commands from else part.
    exit 1
fi
docker build -t cpp-consumer -f=Dockerfile-cpp-consumer .
mkdir -m777 volumes
cd volumes/
mkdir -m777 -p data/kafka data/zk data/grafana logs/kafka logs/zk uploads postgres-data datasets results cms-data cms-uploads
cd ..
unzip datasets/datasets.zip -d volumes/datasets/
cp tests/input_data/* volumes/datasets/
docker-compose build
if ! [[ -f ".env" ]]
then
    cp .env.example .env
    echo "PWD=$PWD" >> .env
fi
