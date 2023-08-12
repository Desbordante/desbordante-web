
<p>
<img src="./images/desbordante-preview.png"/>
</p>

---
# FOR EDBT REVIEWERS

If you are coming from our EDBT Industrial submission, please check out the `edbt` branch to access the following features, which are not merged into main yet:
- Discovery of association rules using ECLAT and FP-Growth algorithms adapted from Christian Borgelt’s implementations
- Discovery of conditional functional dependencies using the CTANE algorithm and its variations

---

# About

Desbordante is a high-performance data profiler that is capable of discovering many different patterns in data using various algorithms. The currently supported data patterns are:
* Functional dependencies, both exact and approximate
* Conditional functional dependencies
* Association rules

It also allows to run data cleaning scenarios using these algorithms. At the moment, we have  implemented a typo detection scenario using an exact and approximate functional dependency discovery algorithm.

The algorithms of Desbordante are implemented in C++ to maximize the resulting performance. They can be run using either a console version or a web-application that features an easy-to-use web interface.

You can try the deployed version [here](https://desbordante.unidata-platform.ru/). You have to register in order to process your own datasets. Keep in mind that due to a large demand various time and memory limits are enforced (and a task is killed if it goes outside of acceptable ranges).

A brief introduction into the tool and its use-cases is presented [here](https://habr.com/ru/company/unidata/blog/667636/) (in Russian, the English version is in the works).

# Installation guide

Requires docker, docker-compose
```
git clone https://github.com/vs9h/Desbordante.git
cd Desbordante/
git checkout origin/web-app
./install_web.sh
```
## Configuring
1) Modify .env file in Desbordante/
2) Set those variables:
* POSTGRES_PASSWORD
* POSTGRES_USER
* POSTGRES_DB
* KAFKA_ADMIN_CLIENT_ID
* CONSUMER_TL_SEC
* CONSUMER_ML_MB
* HOST_SERVER_IP
3) Create your grafana user
```
sudo htpasswd -c grafana-users user1
```
## Running
```
docker-compose up --force-recreate
```
After the launch it will be available at http://localhost:3000/

# Cite

If you use this software for research, please cite the paper (https://fruct.org/publications/fruct29/files/Strut.pdf, https://ieeexplore.ieee.org/document/9435469) as follows:

M. Strutovskiy, N. Bobrov, K. Smirnov and G. Chernishev, "Desbordante: a Framework for Exploring Limits of Dependency Discovery Algorithms," 2021 29th Conference of Open Innovations Association (FRUCT), 2021, pp. 344-354, doi: 10.23919/FRUCT52173.2021.9435469.

# Contacts

[Email me at strutovsky.m.a@gmail.com](mailto:strutovsky.m.a@gmail.com)
