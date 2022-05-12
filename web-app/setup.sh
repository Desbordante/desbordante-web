#!/bin/bash
sh replace_env.sh & ./docker-entrypoint.sh "nginx" -g "daemon off;"