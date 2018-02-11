module.exports = {
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
    nightMode: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Night mode',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    nightModeSwitch: {
        common: {
            type: 'boolean',
            role: 'switch',
            name: 'Switch ON/OFF for Alexa',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorMode: {
        common: {
            type: 'boolean',
            role: 'state',
            name: 'Night, white or RGB mode',
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
            name: 'Brightness down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    brightUp: {
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
    brightDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Brightness down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    brightness: {
        common: {
            type: 'number',
            role: 'level.dimmer',
            name: 'Brightness',
            min: 0,
            max: 100,
            unit: '%',
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
    color: {
        common: {
            type: 'number',
            role: 'level.color',
            name: 'Color',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    rgb: {
        common: {
            type: 'string',
            role: 'level.color.rgb',
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
    },
    modeSpeedUp: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Speed up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    modeSpeedDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Speed down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    link: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Link ?',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    unlink: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Link ?',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    saturationUp: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Saturation up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    saturationDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Saturation down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    saturation: {
        common: {
            type: 'number',
            role: 'level.color.saturation',
            name: 'Saturation',
            min: 0,
            max: 100,
            unit: '%',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorTempUp: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Color temperature up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorTempDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Color temperature down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    colorTemp: {
        common: {
            type: 'number',
            role: 'level.color.temperature',
            name: 'Color temperature',
            min: 2700,
            max: 6500,
            unit: 'K',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    // version 5
    hue: {
        common: {
            type: 'number',
            role: 'level.color.hue',
            name: 'Color HUE',
            min: 0,
            max: 360,
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    speedUp: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Speed up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    speedDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Speed down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    effectSpeedUp: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Effect speed up',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    effectSpeedDown: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Effect speed down',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    effectModeNext: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Effect next',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    effectModePrev: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Effect prev',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    maxBright: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Set maximum brightness',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    allOn: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'All lights on',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    allOff: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'All lights off',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    warmer: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Color warmer',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    cooler: {
        common: {
            type: 'boolean',
            role: 'button',
            name: 'Color cooler',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    },
    brightness2: {
        common: {
            type: 'number',
            role: 'level.dimmer',
            min: 0,
            max: 100,
            unit: '%',
            name: 'Extended level with 22 steps',
            write: true,
            read: false
        },
        native: {
        },
        type: 'state'
    }
};
