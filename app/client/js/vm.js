import m from 'mithril';
import io from 'socket.io-client';
import $ from 'jquery';
import { Zone, Offering } from './model';
import { keyValidator, prepareValidator } from './validator';

let vmInstance = null;

export default class Vm {
    constructor() {
        if (!vmInstance){
            vmInstance = this;
        }
        this.error = m.prop(null);

        this.endpoint = m.prop(null);
        this.apiKey = m.prop(null);
        this.secretKey = m.prop(null);

        this.apiKeyShow = m.prop(false);
        this.secretKeyShow = m.prop(false);

        this.keyValidator = keyValidator;
        this.prepareValidator = prepareValidator;

        this.zoneName = m.prop(null);
        this.offeringName = m.prop(null);
        this.name = m.prop(null);
        this.email = m.prop(null);

        this.messages = m.prop([]);
        this.socket = io.connect('//'+location.host);
        this.socket.on('newdata', (data) => {
            $('#log').append(data);
            let target = document.getElementById('log');
            target.scrollTop = target.scrollHeight;
        });

        let self = this;
        this.socket.on('deployed', (data) => {
            data = JSON.parse(data);
            m.startComputation();
            self.messages().splice(0, 0,'hostname: '+data.name, 'password: '+data.password,
                               'ssh root@'+data.publicip+' -o PreferredAuthentications=password');
            m.endComputation();
        });

        return vmInstance;
    }

    toggleApiKey(show) {
        this.apiKeyShow(show);
    }

    toggleSecretKey(show) {
        this.secretKeyShow(show);
    }

    prepare() {
        this.error = m.prop(null);
        this.keyValidator.validate(this);

        if (this.keyValidator.hasErrors()){
            return m.route('/key');
        }

        let key = {
            endpoint: this.endpoint(),
            apiKey: this.apiKey(),
            secretKey: this.secretKey()
        };

        let self = this;
        Zone.listZones(key)
            .then((zones) => {
                if (!zones) m.route('/key');
                else self.zones = zones;
            }, this.error)
            .then(() => {
                if (this.error()) return;
                Offering.listOfferings(key)
                .then((offerings) => {
                    self.offerings = offerings;
                    m.route('/prepare');
                });
            });
    }

    deploy() {
        this.error = m.prop(null);
        this.messages = m.prop([]);
        this.prepareValidator.validate(this);

        if (this.prepareValidator.hasErrors()){
            return m.route('/prepare');
        }
        m.route('/display');

        this.socket.emit('deploy', this.endpoint(), this.apiKey(), this.secretKey(),
                         this.zoneName(), this.offeringName(),
                         this.name(), this.email());
    }
}
