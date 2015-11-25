import m from 'mithril';
import Alert from './alert';

const DisplayPage = {
    controller: (args) => {
        if (args.vm.keyValidator.hasErrors() || !args.vm.zones || !args.vm.offerings) {
            return m.route('/key');
        }
        return {
            vm: args.vm
        }
    },
    view: (ctrl) => {
        return m('.container-fluid', [
            m('.row' , [
                m('.col-sm-10.col-sm-offset-1.col-md-10.col-md-offset-1', [
                    m.component(Alert,
                                { messages: ['完了までに10分ほどかかる場合があります。画面を閉じずにお待ちください。',
                                             'デバイスの情報は'+ ctrl.vm.email() +' 宛に送信されます。'],
                                  mode: 'info',
                                  title: '注意事項' }),
                    m('h3', 'Log'),
                    m('pre#log'),
                    m('.panel.panel-success', [
                        m('.panel-heading', '仮想マシン情報'),
                        m('.panel-body', [
                            m('ul.list-group',
                              ctrl.vm.messages().map((message) =>
                                m('li.list-group-item', message))
                             )
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default DisplayPage;
