'use strict';

module.exports = function(to, text) {
    let from = process.env.SENDGRID_FROM;
    let apiKey = process.env.SENDGRID_API_KEY;
    if (!from || !apiKey) {
        return 'サーバーのメール設定がありません。';
    }

    let sendgrid  = require('sendgrid')(apiKey);
    sendgrid.send({
        to:       to,
        from:     from,
        subject:  'IDCF チャンネルをインストールしました。',
        text:     text
    }, (err, json) => {
        if (err) {
            return err;
        } else {
            return to+' 宛にメールを送信しました。'
        }
    });
}
