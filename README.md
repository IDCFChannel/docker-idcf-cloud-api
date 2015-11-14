# Node.js IDCF Cloud API Examples with Salt

[idcf-cloud-api](https://www.npmjs.com/package/idcf-cloud-api)を使ったサンプルです。

## Salt Masterless構成

[Salt Masterless](https://docs.saltstack.com/en/latest/topics/tutorials/quickstart.html)はMinionをスタンドアロンで実行します。事前にSalt Masterをセットアップする必要はありません。

## Salt Master/Minion構成

### Salt Master用の仮想マシンの作成

仮想マシンには[Salt Minion](https://docs.saltstack.com/en/latest/ref/configuration/minion.html)がインストールされます。docker-idcf-cloud-apiを実行する仮想マシンはLAN上の[Salt Master](https://docs.saltstack.com/en/latest/ref/configuration/master.html)になります。事前にSalt Master用の仮想マシンを作成します。デフォルトではhostnameを`salt`にします。

Salt Masterのhostnameを`salt`以外にする場合は、Salt Minionの以下のファイルにSalt Masterのhostnameを設定します。

```bash
$ vi /etc/salt/minion.d/master.conf
master: salt
```

### Salt Master

Salt Masterは[Salt Bootstrap](https://docs.saltstack.com/en/latest/topics/tutorials/salt_bootstrap.html)からインストールします。インストール作業はroot権限で実行します。

```bash
$ curl -L https://bootstrap.saltstack.com | sh -s -- -P -M
```

## インストール

Salt Master/Minion構成の場合は、Salt Masterをインストールした仮想マシンにこのリポジトリからgit cloneします。

### DockderとDocker Compose

DockerとDocker Composeをroot権限でインストールします。

```bash
$ curl -sSL https://get.docker.com/ | sh
$ curl -L https://github.com/docker/compose/releases/download/1.5.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose; chmod +x /usr/local/bin/docker-compose
```

git clone

```bash
$ git clone https://github.com/IDCFChannel/docker-idcf-cloud-api.git
$ cd docker-idcf-cloud-api
```

docker-compose.ymlを作成して環境変数を設定します。

```bash
$ mv docker-compose.yml.default docker-compose.yml
$ vi docker-compose.yml
$ mv docker-compose.cli.yml.default docker-compose.cli.yml
$ vi docker-compose.cli.yml
```

クラウドコンソールの[API Key](https://console.idcfcloud.com/user/apikey)から必要な情報をコピーして設定します。

* IDCF_COMPUTE_ENDPOINT: エンドポイント
* IDCF_COMPUTE_API_KEY: API Key

パスワード認証を許可するまでIDCFクラウドに一時的に登録するSSH秘密鍵の名前を設定します。この秘密鍵は毎回再作成されて登録されます。作成した秘密鍵は仮想マシンの`~/.ssh/id-rsa-temp-mythings`にコピーされます。

* IDCF_KEYPAIR: temp-mythings

Salt Masterのホスト名を設定します。

* MASTER_NAME: salt

## 使い方

Salt Master/Minion構成の場合は`create minion`コマンドを実行して引数に作成する仮想マシンの名前を渡します。

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.cli.yml run --rm idcfcloud npm run cli -- create minion minion5
```

Salt Masterless構成の場合は`create masterless`コマンドを使います。

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.cli.yml run --rm idcfcloud npm run cli -- create masterless minion6
```

`create minion`も`create masterless`も同時に複数作成することができます。

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.cli.yml run --rm idcfcloud npm run cli -- create masterless minion7 minion8
```

作成した仮想マシンの情報(パブリックIPアドレス、パスワードなど)は以下のファイルから確認できます。

```bash
$ tail ./data/vms.json
```

### パスワードのリセット

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.cli.yml run --rm idcfcloud npm run cli -- password minion5
```

### 仮想マシンの削除

仮想マシンは複数同時に削除できます。

```bash
$ docker-compose -f docker-compose.yml -f docker-compose.cli.yml run --rm idcfcloud npm run cli -- destroy minion5 minion6
```

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[Masato Shimizu](https://github.com/masato)