/* jshint -W097 */// jshint strict:false
/*jslint node: true */

// var dgram=require('dgram');
// var net=require('net');

"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
var adapter = utils.adapter({
    name: 'milight'});

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});


// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
            adapter.log.debug('entered ready');
    main();
});

function main() {

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.info('config test1: ' + adapter.config.milight_ip);
    adapter.log.info('config test2: ' + adapter.config.milight_port);

/*
    var options = {
        bridge:     adapter.config.milight-ip       || '192.168.178.48',
        port:       adapter.config.milight-port     || 8899
    };
*/
    /**
     *
     *      For every state in the system there has to be also an object of type state
     *
     *      Here a simple template for a boolean variable named "testVariable"
     *
     *      Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
     *
     */
    var obj = adapter.config.groups;
    for (var anz in obj){
        adapter.setObject('Zone' + anz, {
            type: 'channel',
            common: {
                name: 'Licht ' + obj[anz].room,
                role: 'light.color.rgbw'
            },
            native: {
                "ip": adapter.config.milight_ip
            }
        });

        adapter.setObject('Zone' + anz + '.on',
            {
                type: "state",
                common: {
                    name:  "Lampe ein aus",        // mandatory, default _id ??
                    def:   false,                  // optional,  default false
                    type:  "boolean",              // optional,  default "boolean"
                    read:  false,                   // mandatory, default true
                    write: true,                   // mandatory, default true
                    role:  "switch"                // mandatory
                },
                native:{

                }
            });

        adapter.setObject('Zone' + anz + '.state',
            {
            "type": "state",
            "common": {
            "name":  "Licht schalten",
                "type":  "boolean",
                "role":  "switch",
                "read":  true,
                "write": true,
                "desc":  "Licht schalten"
        },
            "native": {}
        });

        adapter.setObject('Zone' + anz + '.bright',
        {
            "type": "state",
            "common": {
            "name":  "Licht Helligkeit",
                "type":  "string",
                "role":  "level.dimmer",
                "read":  true,
                "write": true,
                "desc":  "Licht Helligkeit"
        },
            "native": {}
        });
        adapter.setObject('Zone' + anz + '.hue',
        {
            "type": "state",
            "common": {
            "name":  "Licht Farbe",
                "type":  "number",
                "role":  "level.color.hue",
                "read":  true,
                "write": true,
                "desc":  "Licht Farbe",
                "min":   "0",
                "max":   "255",
                "unit":  "hex"
        },
            "native": {}
        });
        adapter.setObject('Zone' + anz + '.speedup',
        {
            "type": "state",
            "common": {
            "name":  "Speed Up",
                "type":  "boolean",
                "role":  "button",
                "read":  true,
                "write": true,
                "desc":  "Speed Up"
        },
            "native": {}
        });
        adapter.setObject('Zone' + anz + '.speeddown',
        {
            "type": "state",
            "common": {
            "name":  "Speed Down",
                "type":  "boolean",
                "role":  "button",
                "read":  true,
                "write": true,
                "desc":  "Speed Down"
        },
            "native": {}
        });
        adapter.setObject('Zone' + anz + '.disco',
        {
            "type": "state",
            "common": {
            "name":  "Disco Mode",
                "type":  "boolean",
                "role":  "button",
                "read":  true,
                "write": true,
                "desc":  "Disco Mode"
        },
            "native": {}
        });
        adapter.setObject('Zone' + anz + '.colormode',
        {
            "type": "state",
            "common": {
            "name":  "Colormode",
                "type":  "number",
                "role":  "level.saturation",
                "read":  true,
                "write": true,
                "min":   "0",
                "max":   "255",
                "unit":  "hex",
                "desc":  "Colormode"
        },
            "native": {}
        });

        adapter.log.info('Objekt  ' + adapter.namespace + '.Zone'+anz + ' created');
   }

    // in this template all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');


    /**
     *   setState examples
     *
     *   you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
     *
     */

    // the variable testVariable is set to true as command (ack=false)
    adapter.setState('testVariable', true);

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    adapter.setState('testVariable', {val: true, ack: true});



}
