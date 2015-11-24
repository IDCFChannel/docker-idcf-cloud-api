import m from 'mithril';
import 'bootstrap';
//import 'bootstrap/dist/css/bootstrap.css';
import '../css/bootstrap.min.css';
import '../css/main.css';
import Vm from './vm';
import NavBar from './navbar';
import KeyPage from './key';
import PreparePage from './prepare';
import DisplayPage from './display';


const vm = new Vm();

const key = m.component(KeyPage, { vm: vm });
const prepare = m.component(PreparePage, { vm: vm });
const display = m.component(DisplayPage, { vm: vm });

m.mount(document.getElementById('navbar'),
                                m.component(NavBar, {
                                    title: 'IDCF Channel Install'
                                }));

m.route(document.getElementById('root'), '/key', {
    '/key': key,
    '/prepare': prepare,
    '/display': display
});
