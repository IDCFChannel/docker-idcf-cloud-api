import m from 'mithril';
import Alert from './alert';
const KeyPage = {
    controller: (args) => {
        return {
            vm: args.vm
        };
    },
    view: (ctrl) => {
        return ('.container-fluid', [
            m('.row' , [
                m('.col-md-10.col-md-offset-1', [
                    m('.panel.panel-default', [
                        m('.panel-heading', 'API情報'),
                        m('.panel-body', [
                            ctrl.vm.error() ? m.component(Alert,
                                                          { message: ctrl.vm.error().error,
                                                            mode: 'danger',
                                                            title: 'エラー' }) : '',
                            m('div', { class: 'form-group'+(ctrl.vm.keyValidator.hasError('apiKey') ? ' has-error has-feedback' : '') }, [

                                m('label', { class: 'control-label',
                                             type: 'text',
                                             for: 'endpoint' } ,
                                  ctrl.vm.keyValidator.hasError('endpoint') ? ctrl.vm.keyValidator.hasError('endpoint') : 'ENDPOINT'),

                                m('input', { type: 'text',
                                             id: 'endpoint',
                                             class: 'form-control input-lg',
                                             placeholder: 'ENDPOINT',
                                             ariaDescribedby: 'endpoint',
                                             onchange: m.withAttr('value',
                                                                  ctrl.vm.endpoint),
                                             value: ctrl.vm.endpoint()
                                           }),
                                ctrl.vm.keyValidator.hasError('endpoint') ? m('span', { class: 'glyphicon glyphicon-remove form-control-feedback', ariaHidden: true }) : ''
                            ]),

                            m('div', { class: 'form-group'+(ctrl.vm.keyValidator.hasError('apiKey') ? ' has-error has-feedback' : '') }, [

                                m('label', { class: 'control-label',
                                             type: 'text',
                                             for: 'api-key' } ,
                                  ctrl.vm.keyValidator.hasError('apiKey') ? ctrl.vm.keyValidator.hasError('apiKey') : 'API KEY'),

                                m('input', { type: 'text',
                                             id: 'api-key',
                                             class: 'form-control input-lg',
                                             placeholder: 'API KEY',
                                             ariaDescribedby: 'api key',
                                             onchange: m.withAttr('value',
                                                                  ctrl.vm.apiKey),
                                             value: ctrl.vm.apiKey()
                                           }),
                                ctrl.vm.keyValidator.hasError('apiKey') ? m('span', { class: 'glyphicon glyphicon-remove form-control-feedback', ariaHidden: true }) : ''
                            ]),
                            m('div', { class: 'form-group' +
                                       (ctrl.vm.keyValidator.hasError('apiKey') ? ' has-error has-feedback' : '') }, [

                                           m('label', { class: 'control-label',
                                                        type: 'text',
                                                        for:'secret-key'} ,
                                             ctrl.vm.keyValidator.hasError('secretKey') ? ctrl.vm.keyValidator.hasError('secretKey') : 'SECRET KEY'),
                                           m('input', { type: 'text',
                                                        id: 'secret-key',
                                                        class: 'form-control input-lg',
                                                        placeholder: 'SECRET KEY',
                                                        ariaDescribedby: 'secret key',
                                                        onchange: m.withAttr('value',
                                                                             ctrl.vm.secretKey),
                                                        value: ctrl.vm.secretKey()
                                                      }),
                                           ctrl.vm.keyValidator.hasError('secretKey') ? m('span', { class: 'glyphicon glyphicon-remove form-control-feedback', ariaHidden: true }) : ''
                                       ]),

                            m('a', { class: 'btn btn-info btn-lg',
                                     href: '#',
                                     role: 'button',
                                     onclick: () => ctrl.vm.prepare() },
                              '次へ')
                        ])
                    ])
                ])
            ])
        ]);
    }
}

export default KeyPage;
