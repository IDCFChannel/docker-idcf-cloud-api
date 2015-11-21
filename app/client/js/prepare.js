import m from 'mithril';
import Alert from './alert';
const PreparePage = {
    controller: (args) => {
        if (args.vm.keyValidator.hasErrors() || !args.vm.zones
            || !args.vm.offerings || !args.vm.email) {
            return m.route('/key');
        }
        return {
            vm: args.vm
        };
    },
    view: (ctrl) => {
        return m('.container-fluid', [
            m('.row' , [
                m('.col-md-10.col-md-offset-1', [
                    m('.panel.panel-default', [
                        m('.panel-heading', '仮想マシン'),
                        m('.panel-body', [
                            ctrl.vm.error() ? m.component(Alert,
                                                          { message: ctrl.vm.error().error,
                                                            mode: 'danger',
                                                            title: 'エラー' }) : '',
                            m('div', { class: 'form-group'+(ctrl.vm.prepareValidator.hasError('zoneName') ? ' has-error': '') } , [
                                m('label', { class: 'control-label', for: 'zone-group' },
                                  ctrl.vm.prepareValidator.hasError('zoneName') ? ctrl.vm.prepareValidator.hasError('zoneName') : 'ZONES'),
                                m('br'),
                                m('div', { class: 'btn-group btn-group-lg'+(ctrl.vm.prepareValidator.hasError('zoneName') ? ' has-error': '') ,
                                           id: 'zone-group',
                                           role: 'group', ariaLabel: 'Zone Button' },
                                               ctrl.vm.zones
                                                   .map((zone) =>
                                                        m('button', { type: 'button',
                                                                      role: 'group',
                                                                      class: 'btn btn-default' + (ctrl.vm.zoneName() === zone.name() ? ' active' : ''),
                                                                      onclick: () => ctrl.vm.zoneName(zone.name())},
                                                          zone.name()))
                                 ),
                            ]),
                            m('div', { class: 'form-group'+(ctrl.vm.prepareValidator.hasError('offeringName') ? ' has-error': '') } , [
                                m('label', { class: 'control-label', for: 'offering-group' },
                                  ctrl.vm.prepareValidator.hasError('offeringName') ? ctrl.vm.prepareValidator.hasError('offeringName') : 'OFFERING'),

                                m('br'),
                                m('div', { class: 'btn-group btn-group-lg'+(ctrl.vm.prepareValidator.hasError('offeringName') ? ' has-error': '') ,
                                           id: 'offering-group',
                                           role: 'group', ariaLabel: 'Offering Button' },
                                               ctrl.vm.offerings
                                                   .map((offering) =>
                                                        m('button', { type: 'button',
                                                                      role: 'group',
                                                                      class: 'btn btn-default' + (ctrl.vm.offeringName() === offering.name() ? ' active' : ''),
                                                                      onclick: () => ctrl.vm.offeringName(offering.name())},
                                                          offering.name()))
                                 ),
                            ]),
                            m('div', { class: 'form-group'+(ctrl.vm.prepareValidator.hasError('name') ? ' has-error has-feedback': '') } , [
                                m('label', { class: 'control-label', for: 'name' },
                                  ctrl.vm.prepareValidator.hasError('name') ? ctrl.vm.prepareValidator.hasError('name') : 'NAME'),
                                m('input', { type: 'text',
                                             id: 'name',
                                             class: 'form-control input-lg',
                                             placeholder: 'name',
                                             ariaDescribedby: 'name',
                                             onchange: m.withAttr('value',
                                                                  ctrl.vm.name),
                                             value: ctrl.vm.name()
                                           }),
                                ctrl.vm.prepareValidator.hasError('name') ? m('span', { class: 'glyphicon glyphicon-remove form-control-feedback', ariaHidden: true }) : ''
                            ]),

                            m('div', { class: 'form-group'+(ctrl.vm.prepareValidator.hasError('email') ? ' has-error has-feedback': '') } , [
                                m('label', { class: 'control-label', for: 'email' },
                                  ctrl.vm.prepareValidator.hasError('email') ? ctrl.vm.prepareValidator.hasError('email') : 'EMAIL'),
                                m('input', { type: 'text',
                                             id: 'email',
                                             class: 'form-control input-lg',
                                             placeholder: 'email',
                                             ariaDescribedby: 'email',
                                             onchange: m.withAttr('value',
                                                                  ctrl.vm.email),
                                             value: ctrl.vm.email()
                                           }),
                                ctrl.vm.prepareValidator.hasError('email') ? m('span', { class: 'glyphicon glyphicon-remove form-control-feedback', ariaHidden: true }) : ''

                            ]),

                            m('a', { class: 'btn btn-info btn-lg btn-margin-right',
                                     href: '#',
                                     role: 'button',
                                     onclick: () => m.route('/key') },
                              '戻る'),
                            m('a', { class: 'btn btn-primary btn-lg',
                                     href: '#',
                                     role: 'button',
                                     onclick: () => ctrl.vm.deploy() },
                              '作成')

                        ])
                    ])
                ])
            ])
        ])
    }
};

export default PreparePage;
