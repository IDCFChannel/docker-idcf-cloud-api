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
                m('.col-md-10.col-md-offset-1', [
                    m.component(Alert,
                                { message: 'light.S1の場合10分ほどで終了します。画面を閉じずにお待ちください。Logの最後にデバイスのuuidとtokenの一覧が表示されます。',
                                  mode: 'info',
                                  title: '情報' }),
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
