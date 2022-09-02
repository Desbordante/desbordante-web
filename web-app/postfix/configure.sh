#!/bin/bash

### ################## ###
### SITE CONFIGURATION ###
### ################## ###
if [ -z "$POSTFIX_RELAY" ]; then
    POSTFIX_DOMAIN=$(echo $POSTFIX_EMAIL | sed "s/.*@//")
else
    POSTFIX_DOMAIN="desbordante.local"
fi
echo $POSTFIX_DOMAIN > /etc/mailname
# internet hostname of this server (SPF, DMARC, DKIM should be configured in the DNS)
postconf -e myhostname="$POSTFIX_DOMAIN"
# the list of domains that this machine considers itself the final destination for
postconf -e mydestination="$POSTFIX_DOMAIN, $(hostname), localhost"
# the domain that locally-posted mail appears to come from. The default is to append $myhostname
postconf -e myorigin="/etc/mailname"
# forward system mail outside
sed -i "/root:.*/d" /etc/aliases
echo "root: $POSTFIX_ADMINEMAIL" >> /etc/aliases
newaliases

if [ -z "$POSTFIX_RELAY" ]; then
    ### ################## ###
    ### DKIM CONFIGURATION ###
    ### ################## ###
    # generate DKIM keys. Remember to copy the public one into the DNS!
    mkdir -m 750 /etc/opendkim && chown opendkim:opendkim /etc/opendkim
    opendkim-genkey -D /etc/opendkim --domain=$POSTFIX_DOMAIN --selector=mail
    echo "WARNING: add the following TXT entry into the DNS!" >> /etc/opendkim/reminder.txt
    echo "Subdomain: mail._domainkey" >> /etc/opendkim/reminder.txt
    echo "Text: $(cat /etc/opendkim/mail.txt | tr -d '\n' | sed 's/.*v=/v=/; s/[)].*//; s/\"//g; s/\s//g')" >> /etc/opendkim/reminder.txt
    # configure opendkim
    chown opendkim:opendkim /etc/opendkim/mail.private
    chmod 600 /etc/opendkim/mail.private
    cat > /etc/opendkim/TrustedHosts << EOF
127.0.0.1
localhost
172.0.0.0/8
$POSTFIX_DOMAIN
$(hostname)
EOF
    cat > /etc/opendkim.conf << EOF
SubDomains              Yes
SendReports             Yes
Canonicalization        simple/relaxed
Mode                    s
Syslog                  Yes
SyslogSuccess           Yes
LogWhy                  Yes
KeyTable                /etc/opendkim/KeyTable
SigningTable            refile:/etc/opendkim/SigningTable
ExternalIgnoreList      refile:/etc/opendkim/TrustedHosts
InternalHosts           refile:/etc/opendkim/TrustedHosts
Socket                  inet:10021@localhost
ReportAddress           "Desbordante Admin" <$POSTFIX_ADMINEMAIL>
EOF
    echo "mail._domainkey.$POSTFIX_DOMAIN $POSTFIX_DOMAIN:mail:/etc/opendkim/mail.private" > /etc/opendkim/KeyTable
    echo "*@$POSTFIX_DOMAIN mail._domainkey.$POSTFIX_DOMAIN" > /etc/opendkim/SigningTable
    # plug in opendkim into postfix; don't sign messages that bypass smtp (sent via terminal)
    postconf -e milter_default_action="accept"
    postconf -e smtpd_milters="inet:localhost:10021"
else
    ### ################### ###
    ### RELAY CONFIGURATION ###
    ### ################### ###
    # don't try to deliver messages directly
    postconf -e relayhost="$POSTFIX_RELAY"
    # enable client-side authentication
    postconf -e smtp_sasl_auth_enable="yes"
    # location of username and password for the gateway
    postconf -e smtp_sasl_password_maps="hash:/etc/postfix/sasl/sasl_passwd"
    # disallow plain-text authentication
    postconf -e smtp_sasl_security_options="noanonymous"
    
    POSTFIX_RELAYPORT=$(echo $POSTFIX_RELAY | sed "s/.*://")
    if [ "$POSTFIX_RELAYPORT" = "587" ] || [ "$POSTFIX_RELAYPORT" = "465" ]; then
        # enable STARTTLS encryption
        postconf -e smtp_tls_security_level="encrypt"
        # mandatory server certificate verification is appropriate if you only connect to servers that support RFC 2487
        # if you deliver mail to the Internet, this shouldn't be a default policy
        postconf -e smtp_tls_CAfile="/etc/ssl/certs/ca-certificates.crt"
    fi

    ### ################################ ###
    ### SENDER CREDENTIALS CONFIGURATION ###
    ### ################################ ###
    echo "$POSTFIX_RELAY $POSTFIX_EMAIL:$POSTFIX_PASS" > /etc/postfix/sasl/sasl_passwd
    postmap /etc/postfix/sasl/sasl_passwd
    chown root:root /etc/postfix/sasl/sasl_passwd /etc/postfix/sasl/sasl_passwd.db
    chmod 0600 /etc/postfix/sasl/sasl_passwd /etc/postfix/sasl/sasl_passwd.db
fi

# remind to configure DKIM in the DNS
cat /etc/opendkim/reminder.txt >> /var/log/mail.log
cat /etc/opendkim/reminder.txt | mail -r $POSTFIX_EMAIL -s "Please configure DKIM" $POSTFIX_ADMINEMAIL
