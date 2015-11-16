#!/bin/bash
set -eo pipefail

cp /etc/apt/sources.list{,.orig}
sed -i".back" -e "s,//jp.archive.ubuntu.com,//us.archive.ubuntu.com,g" /etc/apt/sources.list

mkdir -p /etc/salt/minion.d

echo -e "{\"ipaddress\":\""$1"\"}" > /root/host.json

cat <<EOF > /etc/salt/minion.d/master.conf
master: $2

EOF

cat <<EOF > /etc/salt/minion.d/grains.conf
grains:
  roles:
    - dev
EOF

cat <<EOF > /etc/salt/minion.d/startup.conf
startup_states: highstate
EOF

curl -L https://bootstrap.saltstack.com | sh -s -- -P
echo 'now installing IDCF Channel Server.'
echo 'please wait approximately 5-10 minutes.'
