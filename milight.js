/* jshint -W097 */// jshint strict:false
/*jslint node: true */

var Milight = require('node-milight-promise').MilightController;
var commands = require('node-milight-promise').commands2;

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

adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!->command');
        var light = new Milight({
            ip: adapter.config.milight_ip,
            delayBetweenCommands: 100,
            commandRepeat: 1
        });
        var tmp = id.split('.');
        var dp = tmp.pop();
        id = tmp.slice(2).join('.'); //ZoneX
        adapter.log.info('id=' + id);
        switch(id){
            case 'AllZones':
                zone = 0;
                break;
            case 'Zone1':
                zone = 1;
                break;
            case 'Zone2':
                zone = 2;
                break;
            case 'Zone3':
                zone = 3;
                break;
            case 'Zone4':
                zone = 4;
                break;
            default:
                zone = 0;
                break;
        }

        if (dp == 'state'){
            if (state.val == 0) {
                light.sendCommands(commands.rgbw.off(zone));
                adapter.log.info(" es wird off gesendet ");
            }
            else if (state.val == 1) {
                light.sendCommands(commands.rgbw.on(zone), commands.rgbw.brightness(100), commands.rgbw.whiteMode(zone));
               adapter.log.info(" es wird on gesendet ");
            }
        }
        if (dp == 'colormode') {
            if (state.val == 'ct') {
                light.sendCommands(commands.rgbw.on(zone), commands.rgbw.whiteMode(zone));
                adapter.log.info(" es wird weiss gesendet ");
            }
            else if (state.val == 'hs') {
                light.sendCommands(commands.rgbw.on(zone), commands.rgbw.hue(55));
                adapter.log.info(" es wird farbe gesendet ");
            }
        } // von colormode

        if (dp == 'bright') {
            light.sendCommands(commands.rgbw.on(zone), commands.rgbw.brightness(state.val));
            adapter.log.info(" es wurde helligkeit gesendet ");

        } // von bri

        if (dp == 'hue') {
            light.sendCommands(commands.rgbw.on(zone), commands.rgbw.hue(state.val));
            adapter.log.info(" es wird farbwert gesendet ");
        } // von hue

        light.close();
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
                "desc":  "Licht Helligkeit",
                "min":   "2",
                "max":   "100",
                "unit":  "%"
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
                "unit":  "hsl"
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
                "type":  "boolean",
                "role":  "boolean",
                "read":  true,
                "write": true,
                "desc":  "Colormode"
        },
            "native": {}
        });

        adapter.log.info('Objekt  ' + adapter.namespace + '.Zone'+anz + ' created');
   }

    // in this template all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');

}
