./pull_datasets.sh
docker build -t cpp-consumer -f=Dockerfile-cpp-consumer .
mkdir -m777 volumes
cd volumes/
mkdir -m777 -p data/kafka data/zk data/grafana logs/kafka logs/zk uploads postgres-data datasets
cd ..
unzip datasets/datasets.zip -d volumes/datasets/
cp tests/inputData/* volumes/datasets/
docker-compose build
cp -n .env.example .env
