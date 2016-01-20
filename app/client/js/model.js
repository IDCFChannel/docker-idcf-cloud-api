import m from 'mithril';

export class Zone {
    constructor(data) {
        this.id = m.prop(data.id);
        this.name = m.prop(data.name);
    }
    static listZones(data) {
        return m.request({ method: 'GET',
                           url: '/api/zones',
                           data: data,
                           type: Zone,
                           initialValue: [] });
    }
}

export class Offering {
    constructor(data) {
        this.id = m.prop(data.id);
        this.name = m.prop(data.name);
    }
    static listOfferings(data) {
        return m.request({ method: 'GET',
                           url: '/api/offerings',
                           data: data,
                           type: Zone,
                           initialValue: [] });
    }
}

/*
export class Key {
    constructor(data) {
        this.apiKey = m.prop(data.apiKey);
        this.secretKey = m.prop(data.secretKey);
    }
}
*/
