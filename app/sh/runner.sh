#!/bin/bash
set -o nounset

#until [ `nmap --open -p 22 $2 |grep -c "ssh"` -eq 1 ]
#do
#  sleep 5
#done

SSH_OPTS="-o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o StrictHostKeyChecking=no"
SSH_KEY="$3"

while :
do
  retval=$(ssh $SSH_OPTS -i $SSH_KEY root@$2 "echo ssh success")

  if [[ "$retval" =~ success$ ]]; then
    echo $retval
    break
  else
    echo -ne "."
    sleep 4
  fi
done

echo 'start salt-minion install.'
scp $SSH_OPTS -i $SSH_KEY $SSH_KEY root@$2:.ssh/
ssh $SSH_OPTS -i $SSH_KEY root@$2 'bash -s' < `dirname $0`/$1 $2 $4
