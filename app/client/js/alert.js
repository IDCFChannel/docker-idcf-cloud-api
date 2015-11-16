import m from 'mithril';

const Alert = {
    controller: () => {},
    view: (ctrl, args) => {
        return  m('.alert.alert-block.alert-'+args.mode+'[role="alert"]', [
                    m('span.glyphicon.glyphicon-exclamation-sign[aria-hidden="true"]'),
                    m('span.sr-only', args.title),
                    m('ul',
                      args.messages.map((message) =>
                        m('li', message))
                     )
        ]);
    }
}

export default Alert;
