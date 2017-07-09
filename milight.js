/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

var utils         = require(__dirname + '/lib/utils'); // Get common adapter utils
var stateCommands = require(__dirname + '/lib/commands');
var light         = null;
var zones         = [];
var commands;

var nameStates = {
    v6 :{
        basic:  ['state', 'on', 'off', 'whiteMode', 'brightnessUp', 'brightnessDown', 'brightness', 'colorUp', 'colorDown', 'color', 'rgb', 'mode'],
        White:  ['state', 'on', 'off', 'maxBright', 'brightnessUp', 'nightMode', 'brightnessDown', 'warmer', 'cooler'],
        RGBO:   ['state', 'on', 'off', 'brightnessUp', 'brightnessDown', 'colorUp', 'colorDown', 'color', 'rgb','modeSpeedUp', 'modeSpeedDown', 'effectModeNext', 'effectModePrev'],
        RGBW:   ['state', 'on', 'off', 'colorMode', 'whiteMode', 'nightMode', 'brightnessUp', 'brightnessDown', 'brightness', 'colorUp', 'colorDown', 'color', 'rgb', 'mode', 'modeSpeedUp', 'modeSpeedDown', 'link', 'unlink'],
        RGBWW:  ['state', 'on', 'off', 'colorMode', 'whiteMode', 'nightMode', 'brightnessUp', 'brightnessDown', 'brightness', 'colorUp', 'colorDown', 'color', 'rgb', 'mode', 'modeSpeedUp', 'modeSpeedDown', 'link', 'unlink', 'saturationUp', 'saturationDown', 'saturation', 'colorTempUp', 'colorTempDown', 'colorTemp']
    },
    v5 :{
        basic:  ['state', 'on', 'off', 'hue', 'rgb', 'whiteMode', 'brightness', 'brightness2', 'effectModeNext', 'effectSpeedUp', 'effectSpeedDown'],
        RGBO:   ['state', 'on', 'off', 'brightnessUp', 'brightnessDown', 'speedUp', 'speedDown', 'effectSpeedUp', 'effectSpeedDown'],
        White:  ['state', 'on', 'off', 'maxBright', 'brightnessUp', 'brightnessDown', 'warmer', 'cooler'],
        RGBW:   ['state', 'on', 'off', 'colorMode', 'hue', 'rgb', 'whiteMode', 'nightMode', 'brightness', 'brightness2', 'effectModeNext', 'effectSpeedUp', 'effectSpeedDown']
    }
};

var adapter       = utils.adapter({
    name: 'milight',
    unload: function (cb) {
        if (light) {
            light.close();
            light = null;
        }
        if (typeof cb === 'function') cb();
    }
});

adapter.on('message', function (obj) {
    var wait = false;
    if (obj) {
        switch (obj.command) {
            case 'browse':
                var discoverBridges = require('node-milight-promise').discoverBridges;
                adapter.log.info('Discover bridges...');
                discoverBridges({
                    type: 'all'
                }).then(function (results) {
                    adapter.log.info('Discover bridges: ' + JSON.stringify(results));
                    if (obj.callback) adapter.sendTo(obj.from, obj.command, results, obj.callback);
                });
                wait = true;
                break;

            default:
                adapter.log.warn('Unknown command: ' + obj.command);
                break;
        }
    }

    if (!wait && obj.callback) {
        adapter.sendTo(obj.from, obj.command, obj.message, obj.callback);
    }

    return true;
});

function checkMethod(zone, funcName) {
    if (zone && typeof zone === 'object' && typeof zone[funcName] === 'function') {
        return true;
    } else {
        var keys = [];
        if (typeof zone === 'object') {
            for (var name in zone) {
                if (zone.hasOwnProperty(name) && typeof zone[name] === 'function') {
                    keys.push(name);
                }
            }
        }
        adapter.log.warn('Property "' + funcName + '" does not exist. Please use on of ' + keys.join(', '));
        return false;
    }
}

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

        if (dp === 'rgb')        dp = 'colorRGB';
        if (dp === 'color')      dp = 'colorMode'; //colorSet nowhere else used
        if (dp === 'saturation') dp = 'saturationSet';
        if (dp === 'colorTemp')  dp = 'colorTempSet';

        if (adapter.config.version === '6') {
            if (dp === 'brightness') dp = 'brightnessSet';
            if (zones[zone]) {

                if (dp === 'colorMode') {
                    if (state.val === 'true' || state.val === true || state.val === 1 || state.val === 'on' || state.val === 'ON') {
                        adapter.log.debug('Send to zone ' + zone + ' whiteMode');
                        zones[zone].command('whiteMode', function (err) {
                            if (!err) {
                                adapter.setForeignState(id, true, true);
                            } else {
                                adapter.log.error('V6 Cannot control: ' + err);
                            }
                        });
                    } else {
                        adapter.log.debug('Send to zone ' + zone + ' nightMode');
                        zones[zone].command('nightMode', function (err) {
                            if (!err) {
                                adapter.setForeignState(id, false, true);
                            } else {
                                adapter.log.error('V6 Cannot control: ' + err);
                            }
                        });
                    }
                } else
                if (dp === 'state') {
                    if (state.val === 'true' || state.val === true || state.val === 1 || state.val === 'on' || state.val === 'ON') {
                        adapter.log.debug('Send to zone ' + zone + ' ON');
                        zones[zone].command('on', function (err) {
                            if (!err) {
                                adapter.setForeignState(id, true, true);
                            } else {
                                adapter.log.error('V6 Cannot control: ' + err);
                            }
                        });
                    } else {
                        adapter.log.debug('Send to zone ' + zone + ' OFF');
                        zones[zone].command('off', function (err) {
                            if (!err) {
                                adapter.setForeignState(id, false, true);
                            } else {
                                adapter.log.error('V6 Cannot control: ' + err);
                            }
                        });
                    }
                } else
                if (typeof zones[zone][dp] === 'function') {
                    var val;
                    if (dp === 'colorRGB') {
                        val = splitColor(state.val);
                        adapter.log.debug('Send to zone ' + zone + ' "' + dp + '": ' + JSON.stringify(val));
                    } else if (dp === 'brightnessSet') {
                        val = Math.round(parseFloat(state.val)); //from 0x00 to 0x64
                        if (val < 0)   val = 0;
                        if (val > 100) val = 100;
                        adapter.log.debug('V6 Send to zone ' + zone + ' "' + dp + '": ' + val);
                    } else {
                        val = parseInt(state.val, 10);
                        adapter.log.debug('V6 Send to zone ' + zone + ' "' + dp + '": ' + val);
                    }
                    zones[zone].command(dp, val, function (err) {
                        if (!err) {
                            adapter.setForeignState(id, state.val, true);
                        } else {
                            adapter.log.error('V6 Cannot control: ' + err);
                        }
                    });
                } else {
                    adapter.log.error('V6 Unknown command: ' + dp);
                }
            } else {
                adapter.log.error('V6 Zone is disabled');
            }
        } else {
            // version 5
            if (dp === 'colorMode') {
                if (state.val === 'hs' || state.val === 'true' || state.val === true || state.val === 1 || state.val === 'on' || state.val === 'ON') {
                    adapter.log.debug('V5 Send to zone ' + zone + ' color Mode with hue=55');
                    if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], 'hue')) return;
                    light.sendCommands(zones[zone].on(zone), zones[zone].hue(55)).then(function () {
                        adapter.setForeignState(id, state.val, true);
                    }, function (err) {
                        adapter.log.error('Cannot control: ' + err);
                    });
                } else {
                    adapter.log.debug('V5 Send to zone ' + zone + ' white Mode via colorMode');
                    if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], 'whiteMode')) return;
                    light.sendCommands(zones[zone].on(zone), zones[zone].whiteMode(zone)).then(function () {
                        adapter.setForeignState(id, state.val, true);
                    }, function (err) {
                        adapter.log.error('Cannot control: ' + err);
                    });
                }
            } else
            if (dp === 'state') {
                if (state.val === 'true' || state.val === true || state.val === 1 || state.val === 'on' || state.val === 'ON') {
                    adapter.log.debug('V5 Send to zone ' + zone + ' ON');
                    if (adapter.config.v5onFullBright === 'true' || adapter.config.v5onFullBright === true || adapter.config.v5onFullBright === 'on' || adapter.config.v5onFullBright === 'ON' || adapter.config.v5onFullBright === 1){
                        if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], 'brightness')) return;
                        light.sendCommands(zones[zone].on(zone), zones[zone].brightness(100), zones[zone].whiteMode(zone)).then(function () {
                            adapter.setForeignState(id, true, true);
                        }, function (err) {
                            adapter.log.error('Cannot control: ' + err);
                        });
                    }
                    else {
                        if (!checkMethod(zones[zone], 'on')) return;
                        light.sendCommands(zones[zone].on(zone)).then(function () {
                            adapter.setForeignState(id, true, true);
                        }, function (err) {
                            adapter.log.error('Cannot control: ' + err);
                        });
                    }
                } else {
                    adapter.log.debug('V5 Send to zone ' + zone + ' OFF');
                    if (!checkMethod(zones[zone], 'off')) return;
                    light.sendCommands(zones[zone].off(zone)).then(function () {
                        adapter.setForeignState(id, false, true);
                    }, function (err) {
                        adapter.log.error('Cannot control: ' + err);
                    });
                }
            } else
            if (dp === 'brightness2' || dp === 'brightness') {       //now 2 variants of brightness can be used in v5
                var val = state.val;
                if (state.val < 0)   val = 0;
                if (state.val > 100) val = 100;
                adapter.log.debug('V5 brightness Send to zone ' + zone + ' "' + dp + '": ' + val);
                if (state.val !== 0)    { //if dim to 0% was chosen turn light off - error handling for iobroker.cloud combo with amazon alexa
                    if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], dp)) return;
                    light.sendCommands(zones[zone].on(zone), zones[zone][dp](val)).then(function () {
                        adapter.setForeignState(id, state.val, true);
                    }, function (err) {
                        adapter.log.error('Cannot control: ' + err);
                    });
                }
                else { // bei 0 wird ausgeschaltet
                    if (!checkMethod(zones[zone], 'off')) return;
                    light.sendCommands(zones[zone].off(zone)).then(function () {
                        adapter.setForeignState(id, state.val, true);
                    }, function (err) {
                        adapter.log.error('Cannot control: ' + err);
                    });
                }
            } else
            if (dp === 'hue') {
                var val = state.val;
                if (state.val < 0)   val = 0;
                if (state.val > 255) val = 255;
                adapter.log.debug('V5 Send to zone ' + zone + ' "' + dp + '": ' + val);
                if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], 'hue')) return;
                light.sendCommands(zones[zone].on(zone), zones[zone].hue(val)).then(function () {
                    adapter.setForeignState(id, val, true);
                }, function (err) {
                    adapter.log.error('Cannot control: ' + err);
                });
            } else
            if (dp === 'colorRGB'){
                var val;
                dp = 'rgb255';
                val = splitColor(state.val);
                adapter.log.debug('V5 Send to zone ' + zone + ' "' + dp + '": ' + val);
                if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], 'colorRGB')) return;
                light.sendCommands(zones[zone].on(zone), zones[zone].colorRGB(val)).then(function () {
                    adapter.setForeignState(id, state.val, true);
                }, function (err) {
                    adapter.log.error('Cannot control: ' + err);
                });
            } else
            if (dp === 'on'){
                adapter.log.debug('V5 Send to zone ' + zone + ' on');
                if (adapter.config.v5onFullBright === 'true' || adapter.config.v5onFullBright === true || adapter.config.v5onFullBright === 'on' || adapter.config.v5onFullBright === 'ON' || adapter.config.v5onFullBright === 1){
                    if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], 'brightness')) return;
                    light.sendCommands(zones[zone].on(zone), zones[zone].brightness(100), zones[zone].whiteMode(zone)).then(function () {
                        adapter.setForeignState(id, false, true); //tastendruck rückgängig machen
                    }, function (err) {
                        adapter.log.error('Cannot control: ' + err);
                    });
                } else {
                    if (!checkMethod(zones[zone], 'on')) return;
                    light.sendCommands(zones[zone].on(zone)).then(function () {
                        adapter.setForeignState(id, false, true); //tastendruck rückgängig machen
                    }, function (err) {
                        adapter.log.error('Cannot control: ' + err);
                    });
                }
            } else
            if (dp === 'off'){
                adapter.log.debug('V5 Send to zone ' + zone + ' off');
                if (!checkMethod(zones[zone], 'off')) return;
                light.sendCommands(zones[zone].off(zone)).then(function () {
                    adapter.setForeignState(id, false, true); //tastendruck rückgängig machen
                }, function (err) {
                    adapter.log.error('Cannot control: ' + err);
                });

            } else
            if (dp === 'nightMode' || dp === 'whiteMode' ){
                adapter.log.debug('V5 Send to zone ' + zone + ' Mode on');
                if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], dp)) return;
                light.sendCommands(zones[zone].on(zone), zones[zone][dp](zone)).then(function () {
                    adapter.setForeignState(id, true, true); //status behalten?
                }, function (err) {
                    adapter.log.error('Cannot control: ' + err);
                });
            } else
            if ( dp === 'maxBright' || dp === 'brightnessUp' || dp === 'brightnessDown' || dp === 'speedUp' || dp === 'speedDown' || dp === 'effectSpeedUp' || dp === 'effectSpeedDown' || dp ==='effectModeNext' || dp ==='cooler'|| dp ==='warmer') {
                adapter.log.debug('V5 Send to zone ' + zone + ' "' + dp + '": ' + state.val);
                if (!checkMethod(zones[zone], 'on') || !checkMethod(zones[zone], dp)) return;
                light.sendCommands(zones[zone].on(zone), zones[zone][dp]()).then(function () {
                    adapter.setForeignState(id, false, true); //tastendruck rückgängig machen
                }, function (err) {
                    adapter.log.error('Cannot control: ' + err);
                });
            } else {
                adapter.log.error('Unknown command: ' + dp);
            }
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



function main() {
    adapter.config.commandRepeat = parseInt(adapter.config.commandRepeat, 10) || 2;

    if (!adapter.config.ip) {
        adapter.log.warn('No IP address defined');
        return;
    }
    if (adapter.config.version === '6') {
        adapter.setState('info.connection', false, true);
        light = new require(__dirname + '/lib/bridge.js')({
            ip:                     adapter.config.ip,
            port:                   parseInt(adapter.config.port, 10) || 5987,
            reconnectTimeout:       10000,
            disconnectTimeout:      10000,
            keepAliveTimeout:       10000,
            delayBetweenCommands:   50,
            commandRepeat:          adapter.config.commandRepeat,
            debug:                  true,
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
        commands    = require('node-milight-promise').commands2;
        light = new Milight({
            ip:                     adapter.config.ip,
            delayBetweenCommands:   adapter.delayBetweenCommands,
            commandRepeat:          adapter.config.commandRepeat
        });
    }
    var objs = [];
    var nameStatesV = nameStates['v' + adapter.config.version];
    for (var n = 0; n < nameStatesV.basic.length; n++) {
        if (!stateCommands[nameStatesV.basic[n]]) {
            adapter.log.error('Unknown command: ' + nameStatesV.basic[n]);
            continue;
        }
        var _obj = JSON.parse(JSON.stringify(stateCommands[nameStatesV.basic[n]]));
        if (!_obj) {
            adapter.log.error('Unknown state: ' + nameStatesV.basic[n]);
            continue;
        }
        _obj.common.name = 'All Zones ' + _obj.common.name;
        _obj._id = adapter.namespace + '.zoneAll.' + nameStatesV.basic[n];
        objs.push(_obj);
    }
    if (adapter.config.version === '6') {
        zones[0] = light.baseCtlFactory();
    } else {
        zones[0] = commands.rgbw;
    }
    for (var z = 1; z <= 4; z++) {
        var type = adapter.config['zone' + z];
        var names = nameStatesV[type];
        if (names) {
            if (adapter.config.version === '6') {
                if (type === 'basic') {
                    zones[z] = light.baseCtlFactory();
                } else
                if (type === 'White')  {
                    zones[z] = light.zoneCtlWhiteFactory(z);
                } else
                if (type === 'RGBO')  {
                    zones[z] = light.zoneCtlRGBFactory(z);
                } else
                if (type === 'RGBW')  {
                    zones[z] = light.zoneCtlRGBWFactory(z);
                } else
                if (type === 'RGBWW') {
                    zones[z] = light.zoneCtlRGBWWFactory(z);
                }
            } else {
                if (type === 'RGBO') {
                    zones[z] = commands.rgb;
                } else
                if (type === 'RGBW')  {
                    zones[z] = commands.rgbw;
                } else
                if (type === 'White') {
                    zones[z] = commands.white;
                }
            }
            for (var s = 0; s < names.length; s++) {
                if (!stateCommands[names[s]]) {
                    adapter.log.error('State ' + names[s] + ' unknown');
                    continue;
                }
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
