/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

var utils    = require(__dirname + '/lib/utils'); // Get common adapter utils
var light    = null;
var commands;
var zones    = [];

var adapter  = utils.adapter({
    name: 'milight',
    unload: function (cb) {
        if (light) {
            light.close();
            light = null;
        }
        if (typeof cb === 'function') cb();
    }
});

function splitColor(rgb) {
    if (!rgb) rgb = '#000000';
    rgb = rgb.toString().toUpperCase();
    if (rgb[0] === '#') rgb = rgb.substring(1);
    if (rgb.length < 6) rgb = rgb[0] + rgb[0] + rgb[1] + rgb[1] + rgb[2] + rgb[2];
    var r = parseInt(rgb[0] + rgb[1], 16);
    var g = parseInt(rgb[2] + rgb[3], 16);
    var b = parseInt(rgb[4] + rgb[5], 16);

    if (rgb.length >= 8) {
        return [r, g, b, parseInt(rgb[6] + rgb[7], 16)];
    } else {
        return [r, g, b];
    }
}

adapter.on('stateChange', function (id, state) {
    if (state && !state.ack && light) {
        var tmp = id.split('.');
        var dp = tmp.pop();
        var strZone = tmp.slice(2).join('.'); //ZoneX
        var zone;
        switch (strZone) {
            case 'zone1':
                zone = 1;
                break;
            case 'zone2':
                zone = 2;
                break;
            case 'zone3':
                zone = 3;
                break;
            case 'zone4':
                zone = 4;
                break;
            case 'zoneAll':
            default:
                zone = 0;
                break;
        }

        if (adapter.config.version === '6') {
            if (zones[zone]) {
                if (dp === 'state') {
                    if (state.val === 'true' || state.val === true || state.val === 1 || state.val === 'on' || state.val === 'ON') {
                        adapter.log.debug('Send to zone ' + zone + ' ON');
                        zones[zone].command('on', function (err) {
                            if (!err) {
                                adapter.setForeignState(id, true, true);
                            } else {
                                adapter.log.error('Cannot control: ' + err);
                            }
                        });
                    } else {
                        adapter.log.debug('Send to zone ' + zone + ' OFF');
                        zones[zone].command('off', function (err) {
                            if (!err) {
                                adapter.setForeignState(id, false, true);
                            } else {
                                adapter.log.error('Cannot control: ' + err);
                            }
                        });
                    }
                } else
                if (typeof zones[zone][dp] === 'function') {
                    var val;
                    if (dp === 'colorRGB') {
                        val = splitColor(state.val);
                    } else {
                        val = parseInt(state.val, 10);
                    }
                    adapter.log.debug('Send to zone ' + zone + ' "' + dp + ': ' + JSON.stringify(val));
                    zones[zone].command(dp, val, function (err) {
                        if (!err) {
                            adapter.setForeignState(id, state.val, true);
                        } else {
                            adapter.log.error('Cannot control: ' + err);
                        }
                    });
                } else {
                    adapter.log.error('Unknown command: ' + dp);
                }
            } else {
                adapter.log.error('Zone is disabled');
            }
        } else {
            if (dp === 'state'){
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
                if (state.val == 0) {
                    light.sendCommands(commands.rgbw.on(zone), commands.rgbw.whiteMode(zone));
                    adapter.log.info(" es wird weiss gesendet ");
                }
                else if (state.val == 1) {
                    light.sendCommands(commands.rgbw.on(zone), commands.rgbw.rgbwMode(zone));
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

        }
    }
});

adapter.on('ready', main);

function mergeObject(obj, cb) {
    adapter.getForeignObject(obj._id, function (err, _obj) {
        if (_obj) {
            var changed = false;
            for (var attr in obj) {
                if (!obj.hasOwnProperty(attr)) continue;

                if (typeof obj[attr] === 'object') {
                    for (var _attr in obj[attr]) {
                        if (obj[attr].hasOwnProperty(_attr) && (!_obj[attr] || _obj[attr][_attr] !== obj[attr][_attr])) {
                            _obj[attr] = _obj[attr] || {};
                            _obj[attr][_attr] = obj[attr][_attr];
                            changed = true;
                        }
                    }
                } else {
                    if (obj[attr] !== _obj[attr]) {
                        _obj[attr] = _obj[attr];
                        changed = true;
                    }
                }
            }
            if (changed) {
                adapter.setForeignObject(obj._id, _obj, function () {
                    cb && cb();
                });
            } else {
                cb && cb();
            }
        } else {
            adapter.setForeignObject(obj._id, obj, function () {
                cb && cb();
            });
        }
    });
}

function mergeObjects(objs, cb) {
    if (!objs || !objs.length) {
        if (typeof cb === 'function') {
            cb();
        }
        return;
    }
    mergeObject(objs.shift(), function () {
        setTimeout(mergeObjects, 0, objs, cb);
    });
}

var stateCommands = {
    state: {
        common: {
            type: 'boolean',
            role: 'switch',
            name: 'Switch ON/OFF',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    on: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'ON',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    off: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'OFF',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    whiteMode: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'White mode',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    brightnessUp: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Brightness up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    brightnessDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Brightness up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    brightnessSet: {
        common: {
            type: 'number',
            role: 'level.dimmer',
            name: 'Brightness',
            min: 0,
            max: 255,
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorUp: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Color up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Color down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorSet: {
        common: {
            type: 'number',
            role: 'level.color',
            name: 'Color',
            min: 0,
            max: 255,
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorRGB: {
        common: {
            type: 'string',
            role: 'level.rgb',
            name: 'Color RGB',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    mode: {
        common: {
            type: 'number',
            role: 'state',
            name: 'mode',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    }
};

var nameStates = {
    basic: ['state', 'on', 'off', 'whiteMode', 'brightnessUp', 'brightnessDown', 'brightnessSet', 'colorUp', 'colorDown', 'colorSet', 'colorRGB', 'mode'],
    RGBW:  ['state', 'on', 'off', 'whiteMode', 'brightnessUp', 'brightnessDown', 'brightnessSet', 'colorUp', 'colorDown', 'colorSet', 'colorRGB', 'mode'],
    RGBWW: ['state', 'on', 'off', 'whiteMode', 'brightnessUp', 'brightnessDown', 'brightnessSet', 'colorUp', 'colorDown', 'colorSet', 'colorRGB', 'mode']
};

function main() {
    if (adapter.config.version === '6') {
        adapter.setState('info.connection', false, true);
        light = new require(__dirname + '/lib/bridge.js')({
            ip:                     adapter.config.ip,
            port:                   parseInt(adapter.config.port, 10) || 5987,
            reconnectTimeout:       10000,
            disconnectTimeout:      10000,
            keepAliveTimeout:       10000,
            delayBetweenCommands:   50,
            commandRepeat:          2,
            log:                    {
                log:   function (text) {
                    adapter.log.debug(text);
                },
                error: function (text) {
                    adapter.log.error(text);
                }
            }
        });
        light.on('connected', function () {
            adapter.setState('info.connection', true, true);
        });
        light.on('disconnected', function () {
            adapter.setState('info.connection', false, true);
        });
        zones[0] = light.baseCtlFactory();
    } else {
        adapter.setState('info.connection', true, true);
        var Milight = require('node-milight-promise').MilightController;
        commands    = require('node-milight-promise').commands;
        light = new Milight({
            ip:                     adapter.config.ip,
            delayBetweenCommands:   50,
            commandRepeat:          2
        });
    }
    var objs = [];
    for (var n = 0; n < nameStates.basic.length; n++) {
        var _obj = JSON.parse(JSON.stringify(stateCommands[nameStates.basic[n]]));
        if (!_obj) {
            adapter.log.error('Unknown state: ' + nameStates.basic[n]);
            continue;
        }
        _obj.common.name = 'All Zones ' + _obj.common.name;
        _obj._id = adapter.namespace + '.zoneAll.' + nameStates.basic[n];
        objs.push(_obj);
    }
    for (var z = 1; z <= 4; z++) {
        var type = adapter.config['zone' + z];
        var names = nameStates[type];
        if (names) {
            if (adapter.config.version === '6') {
                zones[z] = light.zoneCtlRGBWFactory(z);
            }
            for (var s = 0; s < names.length; s++) {
                var obj = JSON.parse(JSON.stringify(stateCommands[names[s]]));
                if (!obj) {
                    adapter.log.error('Unknown state: ' + names[s]);
                    continue;
                }
                obj.common.name = 'Zone ' + z + ' ' + obj.common.name;
                obj._id = adapter.namespace + '.zone' + z + '.' + names[s];
                objs.push(obj);
            }
        }
    }

    mergeObjects(objs, function () {
        adapter.subscribeStates('*');
    });
}
