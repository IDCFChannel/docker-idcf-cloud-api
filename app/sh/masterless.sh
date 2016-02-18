#!/bin/bash
set -eo pipefail

cp /etc/apt/sources.list{,.orig}
sed -i".back" -e "s,//ftp.jp.debian.org,//ftp.us.debian.org,g" /etc/apt/sources.list

apps_dir=/root/iot_apps
mkdir -p /etc/salt/minion.d /srv $apps_dir

echo -e "{\"ipaddress\":\""$1"\"}" > /tmp/host.json

apt-get update && apt-get install -y git
git clone https://github.com/IDCFChannel/meshblu-salt.git $apps_dir/meshblu-salt
mv $apps_dir/meshblu-salt/srv/salt/config/salt /srv/

cat <<EOF > /etc/salt/minion.d/masterless.conf
file_client: local
startup_states: highstate
EOF

cat <<EOF > /etc/salt/minion.d/grains.conf
grains:
  roles:
    - dev
EOF

curl -L https://bootstrap.saltstack.com | sh -s -- -P
echo 'now installing IDCF Channel Server.'
echo 'please wait approximately 5-10 minutes.'

salt-call --local state.highstate
