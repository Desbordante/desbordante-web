FROM python:3.8-slim
RUN apt-get update && apt-get install -y librdkafka-dev docker
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .
ENTRYPOINT ["python", "-u", "consumer.py"]