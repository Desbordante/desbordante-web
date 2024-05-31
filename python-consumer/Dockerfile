FROM mirror.gcr.io/python:3.10.5
RUN apt-get update && apt-get install -y librdkafka-dev docker
COPY requirements.txt requirements.txt
RUN pip3 install --upgrade pip && pip3 install -r requirements.txt
COPY . .
ENTRYPOINT ["python", "-u", "consumer.py"]
