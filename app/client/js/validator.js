import m from 'mithril';
import mvalidator from 'mithril-validator';
mvalidator(m);
import validation from 'validator';

export const keyValidator = new m.validator({
    endpoint: (endpoint) => {
        if (!endpoint) {
            return 'ENDPOINT is required';
        }
    },
    apiKey: (apiKey) => {
        if (!apiKey) {
            return 'API KEY is required';
        }
    },
    secretKey: (secretKey) => {
        if (!secretKey) {
            return 'SECRET KEY is required';
        }
    }
});

export const prepareValidator = new m.validator({
    zoneName: (zoneName) => {
        if (!zoneName) {
            return 'ZONE is required';
        }
    },
    offeringName: (offeringName) => {
        if (!offeringName) {
            return 'OFFERING is required';
        }
    },
    name: (name) => {
        if (!name) {
            return 'NAME is required';
        }
    },
    email: (email) => {
        if (!email) {
            return 'EMAIL is required';
        }
        if (!validation.isEmail(email)) {
            return 'EMAIL is not valid';
        }
    }
});
