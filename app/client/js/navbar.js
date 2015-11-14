import m from 'mithril';

const NavBar = {
    view: (ctrl, args) => {
        return m('.container', [
            m('.nav-header', [
                m('a.navbar-brand', { href: '#' }, args.title)
            ])
        ]);
    }
}

export default NavBar;
