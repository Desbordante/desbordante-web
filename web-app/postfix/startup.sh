#!/bin/bash

if [ -f "./configured" ]; then
    echo "Desbordante-postfix started at $(date) on the $HOSTNAME machine." | mail -r $POSTFIX_EMAIL -a "From: Desbordante <$POSTFIX_EMAIL>" -s "Desbordante-postfix started" $POSTFIX_ADMINEMAIL
else 
    ./configure.sh
    touch ./configured
    # don't read the kernel logs
    sed -i "/imklog/s/^/#/" /etc/rsyslog.conf
    touch /var/log/mail.log /var/log/mail.err /var/log/mail.warn
    chmod a+rw /var/log/mail.log
fi

### ##### ###
### START ###
### ##### ###
service rsyslog start
service postfix start
if [ -z "$POSTFIX_RELAY" ]; then
    service opendkim start
fi
# follow the logs
tail -F /var/log/mail.log
