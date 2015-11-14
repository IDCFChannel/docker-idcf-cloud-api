import m from 'mithril';

const Alert = {
    controller: () => {},
    view: (ctrl, args) => {
        return  m('.alert.alert-'+args.mode+'[role="alert"]', [
                    m('span.glyphicon.glyphicon-exclamation-sign[aria-hidden="true"]'),
                    m('span.sr-only', args.title),
                    args.message
        ]);
    }
}

export default Alert;
