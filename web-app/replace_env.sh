#!/bin/bash

find /usr/share/nginx/html/ -type f -name "*.js" -exec sed -i '' -e "s/REACT_APP_HOST_SERVER_IP/$REACT_APP_HOST_SERVER_IP/g" {} + 
find /usr/share/nginx/html/ -type f -name "*.js" -exec sed -i '' -e "s/REACT_APP_SERVER_PORT/$REACT_APP_SERVER_PORT/g" {} +
find /usr/share/nginx/html/ -type f -name "*.js" -exec sed -i '' -e "s/REACT_APP_SERVER_PROTOCOL/$REACT_APP_SERVER_PROTOCOL/g" {} +
find /usr/share/nginx/html/ -type f -name "*.js" -exec sed -i '' -e "s/REACT_APP_PASSWORD_SALT_PREFIX/$REACT_APP_PASSWORD_SALT_PREFIX/g" {} +
find /usr/share/nginx/html/ -type f -name "*.js" -exec sed -i '' -e "s/REACT_APP_PASSWORD_SALT_POSTFIX/$REACT_APP_PASSWORD_SALT_POSTFIX/g" {} +