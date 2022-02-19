FROM python:3.8-slim
RUN apt-get update && apt-get install -y librdkafka-dev=1.6.0-1 docker=1.5-2
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .
ENTRYPOINT ["python", "-u", "consumer.py"]