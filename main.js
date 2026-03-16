"use strict";

/*
 * Created with @iobroker/create-adapter v2.0.2
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");
var stateCommands = require(`${__dirname}/lib/commands`);
var light = null;
var zones = [];
var commands;

var nameStates = {
  v6: {
    basic: [
      "state",
      "on",
      "off",
      "whiteMode",
      "brightnessUp",
      "brightnessDown",
      "brightness",
      "colorUp",
      "colorDown",
      "color",
      "rgb",
      "mode",
    ],
    White: [
      "state",
      "on",
      "off",
      "maxBright",
      "brightnessUp",
      "nightMode",
      "brightnessDown",
      "warmer",
      "cooler",
      "nightModeSwitch",
    ],
    RGBO: [
      "state",
      "on",
      "off",
      "brightnessUp",
      "brightnessDown",
      "colorUp",
      "colorDown",
      "color",
      "rgb",
      "modeSpeedUp",
      "modeSpeedDown",
      "effectModeNext",
      "effectModePrev",
    ],
    RGBW: [
      "state",
      "on",
      "off",
      "colorMode",
      "whiteMode",
      "nightMode",
      "brightnessUp",
      "brightnessDown",
      "brightness",
      "colorUp",
      "colorDown",
      "color",
      "rgb",
      "hue",
      "mode",
      "modeSpeedUp",
      "modeSpeedDown",
      "link",
      "unlink",
    ],
    RGBWW: [
      "state",
      "on",
      "off",
      "colorMode",
      "whiteMode",
      "nightMode",
      "brightnessUp",
      "brightnessDown",
      "brightness",
      "colorUp",
      "colorDown",
      "color",
      "rgb",
      "hue",
      "mode",
      "modeSpeedUp",
      "modeSpeedDown",
      "link",
      "unlink",
      "saturationUp",
      "saturationDown",
      "saturation",
      "colorTempUp",
      "colorTempDown",
      "colorTemp",
    ],
  },
  v5: {
    basic: [
      "state",
      "on",
      "off",
      "hue",
      "rgb",
      "whiteMode",
      "brightness",
      "brightness2",
      "effectModeNext",
      "effectSpeedUp",
      "effectSpeedDown",
    ],
    RGBO: [
      "state",
      "on",
      "off",
      "brightUp",
      "brightDown",
      "speedUp",
      "speedDown",
      "effectSpeedUp",
      "effectSpeedDown",
    ],
    White: [
      "state",
      "on",
      "off",
      "maxBright",
      "brightUp",
      "brightDown",
      "warmer",
      "cooler",
    ],
    RGBW: [
      "state",
      "on",
      "off",
      "colorMode",
      "hue",
      "rgb",
      "whiteMode",
      "nightMode",
      "brightness",
      "brightness2",
      "effectModeNext",
      "effectSpeedUp",
      "effectSpeedDown",
    ],
  },
};

class Milight extends utils.Adapter {
  /**
   * @param {Partial<utils.AdapterOptions>} [options]
   */
  constructor(options) {
    super({
      ...options,
      name: "milight",
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    // this.on('objectChange', this.onObjectChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
    this.plc = null;
  }

  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    // Initialize your adapter here
    this.config.commandRepeat = this.config.commandRepeat || 2;

    if (!this.config.ip) {
      this.log.warn("No IP address defined");
      return;
    }
    if (this.config.version === "6") {
      this.setState("info.connection", false, true);
      // @ts-expect-error only void function, but this is only directory
      light = new require(`${__dirname}/lib/bridge.js`)({
        ip: this.config.ip,
        port: parseInt(this.config.port, 10) || 5987,
        reconnectTimeout: 10000,
        disconnectTimeout: 10000,
        keepAliveTimeout: 10000,
        delayBetweenCommands: 50,
        commandRepeat: this.config.commandRepeat,
        debug: true,
        log: {
          log: (text) => {
            this.log.debug(text);
          },
          error: (text) => {
            this.log.error(text);
          },
        },
      });
      light.on("connected", () => {
        this.setState("info.connection", true, true);
      });
      light.on("disconnected", () => {
        this.setState("info.connection", false, true);
      });
      zones[0] = light.baseCtlFactory();
    } else {
      this.setState("info.connection", true, true);
      var Milight = require("node-milight-promise").MilightController;
      commands = require("node-milight-promise").commands2;
      light = new Milight({
        ip: this.config.ip,
        delayBetweenCommands: this.config.delayBetweenCommands,
        commandRepeat: this.config.commandRepeat,
      });
    }
    var objs = [];
    var nameStatesV = nameStates[`v${this.config.version}`];
    for (var n = 0; n < nameStatesV.basic.length; n++) {
      if (!stateCommands[nameStatesV.basic[n]]) {
        this.log.error(`Unknown command: ${nameStatesV.basic[n]}`);
        continue;
      }
      var _obj = JSON.parse(
        JSON.stringify(stateCommands[nameStatesV.basic[n]])
      );
      if (!_obj) {
        this.log.error(`Unknown state: ${nameStatesV.basic[n]}`);
        continue;
      }
      _obj.common.name = `All Zones ${_obj.common.name}`;
      _obj._id = `${this.namespace}.zoneAll.${nameStatesV.basic[n]}`;
      objs.push(_obj);
    }
    if (this.config.version === "6") {
      zones[0] = light.baseCtlFactory();
    } else {
      zones[0] = commands.rgbw;
    }
    for (var z = 1; z <= 4; z++) {
      var type = this.config[`zone${z}`];
      var names = nameStatesV[type];
      if (names) {
        if (this.config.version === "6") {
          if (type === "basic") {
            zones[z] = light.baseCtlFactory();
          } else if (type === "White") {
            zones[z] = light.zoneCtlWhiteFactory(z);
          } else if (type === "RGBO") {
            zones[z] = light.zoneCtlRGBFactory(z);
          } else if (type === "RGBW") {
            zones[z] = light.zoneCtlRGBWFactory(z);
          } else if (type === "RGBWW") {
            zones[z] = light.zoneCtlRGBWWFactory(z);
          }
        } else {
          if (type === "RGBO") {
            zones[z] = commands.rgb;
          } else if (type === "RGBW") {
            zones[z] = commands.rgbw;
          } else if (type === "White") {
            zones[z] = commands.white;
          }
        }
        for (var s = 0; s < names.length; s++) {
          if (!stateCommands[names[s]]) {
            this.log.error(`State ${names[s]} unknown`);
            continue;
          }
          var obj = JSON.parse(JSON.stringify(stateCommands[names[s]]));
          if (!obj) {
            this.log.error(`Unknown state: ${names[s]}`);
            continue;
          }
          obj.common.name = `Zone ${z} ${obj.common.name}`;
          obj._id = `${this.namespace}.zone${z}.${names[s]}`;
          objs.push(obj);
        }
      }
    }

    this.mergeObjects(objs, () => {
      this.subscribeStates("*");
    });
    this.subscribeStates("*");
    // examples for the checkPassword/checkGroup functions
    let result = await this.checkPasswordAsync("admin", "iobroker");
    this.log.info(`check user admin pw iobroker: ${result}`);

    result = await this.checkGroupAsync("admin", "admin");
    this.log.info(`check group user admin group admin: ${result}`);
  }

  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   *
   * @param {() => void} callback
   * callback callback
   */
  async onUnload(callback) {
    try {
      // Here you must clear all timeouts or intervals that may still be active
      // clearTimeout(timeout1);
      // clearTimeout(timeout2);
      // ...
      // clearInterval(interval1);
      if (light) {
        light.close();
        light = null;
      }
      //await this.plc.logout();
      callback();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      callback();
    }
  }

  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  * @param {string} id
  //  * @param {ioBroker.Object | null | undefined} obj
  //  */
  // onObjectChange(id, obj) {
  // 	if (obj) {
  // 		// The object was changed
  // 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
  // 	} else {
  // 		// The object was deleted
  // 		this.log.info(`object ${id} deleted`);
  // 	}
  // }

  /**
   * Is called if a subscribed state changes
   *
   * @param {string} id
   * @param {ioBroker.State | null | undefined} state
   */
  onStateChange(id, state) {
    if (state) {
      // The state was changed
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
      if (state && !state.ack && light) {
        var tmp = id.split(".");
        var dp = tmp.pop();
        var strZone = tmp.slice(2).join("."); //ZoneX
        var zone;
        switch (strZone) {
          case "zone1":
            zone = 1;
            break;
          case "zone2":
            zone = 2;
            break;
          case "zone3":
            zone = 3;
            break;
          case "zone4":
            zone = 4;
            break;
          case "zoneAll":
          default:
            zone = 0;
            break;
        }

        if (dp === "rgb") {
          dp = "colorRGB";
        }
        if (dp === "color") {
          dp = "colorMode";
        } //colorSet nowhere else used
        if (dp === "saturation") {
          dp = "saturationSet";
        }
        if (dp === "colorTemp") {
          dp = "colorTempSet";
        }

        if (this.config.version === "6") {
          if (dp === "brightness") {
            dp = "brightnessSet";
          }
          if (zones[zone]) {
            if (dp === "hue") {
              var colorhex = this.hsvToRgb(state.val, 80, 100);
              var val = this.splitColor(colorhex);
              this.log.debug(
                `Send to zone ${zone} "${dp}": ${JSON.stringify(
                  val
                )} (which is ${colorhex} out of hue${state.val})`
              );
              zones[zone].command("colorRGB", val, (err) => {
                if (!err) {
                  this.setState(id, state.val, true);
                  // this.setState(id.replace('.hue','.rgb'), colorhex, true); //Nachführung von rgb
                } else {
                  this.log.error(`V6 Cannot control: ${err}`);
                }
              });
            } else if (dp === "colorMode") {
              if (
                state.val === "true" ||
                state.val === true ||
                state.val === 1 ||
                state.val === "on" ||
                state.val === "ON"
              ) {
                this.log.debug(`Send to zone ${zone} whiteMode`);
                zones[zone].command("whiteMode", (err) => {
                  if (!err) {
                    this.setState(id, true, true);
                  } else {
                    this.log.error(`V6 Cannot control: ${err}`);
                  }
                });
              } else {
                this.log.debug(`Send to zone ${zone} nightMode`);
                zones[zone].command("nightMode", (err) => {
                  if (!err) {
                    this.setState(id, false, true);
                  } else {
                    this.log.error(`V6 Cannot control: ${err}`);
                  }
                });
              }
            } else if (dp === "state") {
              if (
                state.val === "true" ||
                state.val === true ||
                state.val === 1 ||
                state.val === "on" ||
                state.val === "ON"
              ) {
                this.log.debug(`Send to zone ${zone} ON`);
                zones[zone].command("on", (err) => {
                  if (!err) {
                    this.setState(id, true, true);
                  } else {
                    this.log.error(`V6 Cannot control: ${err}`);
                  }
                });
              } else {
                this.log.debug(`Send to zone ${zone} OFF`);
                zones[zone].command("off", (err) => {
                  if (!err) {
                    this.setState(id, false, true);
                  } else {
                    this.log.error(`V6 Cannot control: ${err}`);
                  }
                });
              }
            } else if (dp === "nightModeSwitch") {
              if (
                state.val === "true" ||
                state.val === true ||
                state.val === 1 ||
                state.val === "on" ||
                state.val === "ON"
              ) {
                this.log.debug(`Send to zone ${zone} nightMode`);
                zones[zone].command("nightMode", (err) => {
                  if (!err) {
                    this.setState(id, false, true); //automatisches zurücksetzen für den nächsten Alexa Befehl
                  } else {
                    this.log.error(`V6 Cannot control: ${err}`);
                  }
                });
              }
            } else if (typeof zones[zone][dp] === "function") {
              var val;
              if (dp === "colorRGB") {
                val = this.splitColor(state.val);
                this.log.debug(
                  `Send to zone ${zone} "${dp}": ${JSON.stringify(val)}`
                );
              } else if (dp === "brightnessSet") {
                val = Math.round(parseFloat(state.val)); //from 0x00 to 0x64
                if (val < 0) {
                  val = 0;
                }
                if (val > 100) {
                  val = 100;
                }
                this.log.debug(`V6 Send to zone ${zone} "${dp}": ${val}`);
              } else {
                val = parseInt(state.val, 10);
                this.log.debug(`V6 Send to zone ${zone} "${dp}": ${val}`);
              }
              zones[zone].command(dp, val, (err) => {
                if (!err) {
                  this.setState(id, state.val, true);
                  if (dp === "on") {
                    this.setState(id, false, true); //Taste auf 0 setzen
                    this.setState(id.replace(".on", ".state"), true, true); //Nachführung von state
                  }
                  if (dp === "off") {
                    this.setState(id, false, true); //Taste auf 0 setzen
                    this.setState(id.replace(".off", ".state"), false, true); //Nachführung von state
                  }
                  if (dp === "colorRGB") {
                    var h = this.rgbToHsv(val[0], val[1], val[2]);
                    // this.setState(id.replace('.rgb','.hue'), h[0], true); //Nachführung von hue
                  }
                } else {
                  this.log.error(`V6 Cannot control: ${err}`);
                }
              });
            } else {
              this.log.error(`V6 Unknown command: ${dp}`);
            }
          } else {
            this.log.error("V6 Zone is disabled");
          }
        } else {
          // version 5
          if (dp === "colorMode") {
            if (
              state.val === "hs" ||
              state.val === "true" ||
              state.val === true ||
              state.val === 1 ||
              state.val === "on" ||
              state.val === "ON"
            ) {
              this.log.debug(`V5 Send to zone ${zone} color Mode with hue=55`);
              if (
                !this.checkMethod(zones[zone], "on") ||
                !this.checkMethod(zones[zone], "hue")
              ) {
                return;
              }
              light
                .sendCommands(zones[zone].on(zone), zones[zone].hue(55))
                .then(
                  () => {
                    this.setState(id, state.val, true);
                  },
                  (err) => {
                    this.log.error(`Cannot control: ${err}`);
                  }
                );
            } else {
              this.log.debug(
                `V5 Send to zone ${zone} white Mode via colorMode`
              );
              if (
                !this.checkMethod(zones[zone], "on") ||
                !this.checkMethod(zones[zone], "whiteMode")
              ) {
                return;
              }
              light
                .sendCommands(zones[zone].on(zone), zones[zone].whiteMode(zone))
                .then(
                  () => {
                    this.setState(id, state.val, true);
                  },
                  (err) => {
                    this.log.error(`Cannot control: ${err}`);
                  }
                );
            }
          } else if (dp === "state") {
            if (
              state.val === "true" ||
              state.val === true ||
              state.val === 1 ||
              state.val === "on" ||
              state.val === "ON"
            ) {
              this.log.debug(`V5 Send to zone ${zone} ON`);
              if (
                this.config.v5onFullBright == "true" ||
                this.config.v5onFullBright == true ||
                this.config.v5onFullBright == "on" ||
                this.config.v5onFullBright == "ON" ||
                this.config.v5onFullBright == 1
              ) {
                if (
                  !this.checkMethod(zones[zone], "on") ||
                  !this.checkMethod(zones[zone], "brightness")
                ) {
                  return;
                }
                light
                  .sendCommands(
                    zones[zone].on(zone),
                    zones[zone].brightness(100),
                    zones[zone].whiteMode(zone)
                  )
                  .then(
                    () => {
                      this.setState(id, true, true);
                    },
                    (err) => {
                      this.log.error(`Cannot control: ${err}`);
                    }
                  );
              } else {
                if (!this.checkMethod(zones[zone], "on")) {
                  return;
                }
                light.sendCommands(zones[zone].on(zone)).then(
                  () => {
                    this.setState(id, true, true);
                  },
                  (err) => {
                    this.log.error(`Cannot control: ${err}`);
                  }
                );
              }
            } else {
              this.log.debug(`V5 Send to zone ${zone} OFF`);
              if (!this.checkMethod(zones[zone], "off")) {
                return;
              }
              light.sendCommands(zones[zone].off(zone)).then(
                () => {
                  this.setState(id, false, true);
                },
                (err) => {
                  this.log.error(`Cannot control: ${err}`);
                }
              );
            }
          } else if (dp === "brightness2" || dp === "brightness") {
            //now 2 variants of brightness can be used in v5
            var val = state.val;
            if (state.val < 0) {
              val = 0;
            }
            if (state.val > 100) {
              val = 100;
            }
            this.log.debug(
              `V5 brightness Send to zone ${zone} "${dp}": ${val}`
            );
            if (state.val !== 0) {
              //if dim to 0% was chosen turn light off - error handling for iobroker.cloud combo with amazon alexa
              if (
                !this.checkMethod(zones[zone], "on") ||
                !this.checkMethod(zones[zone], dp)
              ) {
                return;
              }
              light
                .sendCommands(zones[zone].on(zone), zones[zone][dp](val))
                .then(
                  () => {
                    this.setState(id, state.val, true);
                  },
                  (err) => {
                    this.log.error(`Cannot control: ${err}`);
                  }
                );
            } else {
              // bei 0 wird ausgeschaltet
              if (!this.checkMethod(zones[zone], "off")) {
                return;
              }
              light.sendCommands(zones[zone].off(zone)).then(
                () => {
                  this.setState(id, state.val, true);
                },
                (err) => {
                  this.log.error(`Cannot control: ${err}`);
                }
              );
            }
          } else if (dp === "hue") {
            var val = state.val;
            if (state.val < 0) {
              val = 0;
            }
            if (state.val > 255) {
              val = 255;
            }
            var colorhex = this.hsvToRgb(val, 80, 100);
            this.log.debug(`V5 Send to zone ${zone} "${dp}": ${val}`);
            if (
              !this.checkMethod(zones[zone], "on") ||
              !this.checkMethod(zones[zone], "hue")
            ) {
              return;
            }
            light.sendCommands(zones[zone].on(zone), zones[zone].hue(val)).then(
              () => {
                this.setState(id, val, true);
                // this.setState(id.replace('.hue','.rgb'), colorhex, true); //Nachführung von rgb
              },
              (err) => {
                this.log.error(`Cannot control: ${err}`);
              }
            );
          } else if (dp === "colorRGB") {
            var val;
            dp = "rgb";
            val = this.splitColor(state.val);
            this.log.debug(`V5 Send to zone ${zone} "${dp}": ${val}`);
            if (
              !this.checkMethod(zones[zone], "on") ||
              !this.checkMethod(zones[zone], "rgb255")
            ) {
              return;
            }
            var rbgAsHue = zones[zone].rgb255(val[0], val[1], val[2]);
            light.sendCommands(zones[zone].on(zone), rbgAsHue).then(
              () => {
                // this.setState(id, state.val, true); // causes infinite loop but it doesn't matter as we either set it, or not
                // var h = rgbToHsv(val[0],val[1],val[2]);
                // this.setState(id.replace('.rgb','.hue'), h[0], true); //Nachführung von hue
              },
              (err) => {
                this.log.error(`Cannot control: ${err}`);
              }
            );
          } else if (dp === "on") {
            this.log.debug(`V5 Send to zone ${zone} on`);
            if (
              this.config.v5onFullBright === "true" ||
              this.config.v5onFullBright === true ||
              this.config.v5onFullBright === "on" ||
              this.config.v5onFullBright === "ON" ||
              this.config.v5onFullBright === 1
            ) {
              if (
                !this.checkMethod(zones[zone], "on") ||
                !this.checkMethod(zones[zone], "brightness")
              ) {
                return;
              }
              light
                .sendCommands(
                  zones[zone].on(zone),
                  zones[zone].brightness(100),
                  zones[zone].whiteMode(zone)
                )
                .then(
                  () => {
                    this.setState(id, false, true); //tastendruck rückgängig machen
                    this.setState(id.replace(".on", ".state"), true, true); //Nachführung von state
                  },
                  (err) => {
                    this.log.error(`Cannot control: ${err}`);
                  }
                );
            } else {
              if (!this.checkMethod(zones[zone], "on")) {
                return;
              }
              light.sendCommands(zones[zone].on(zone)).then(
                () => {
                  this.setState(id, false, true); //tastendruck rückgängig machen
                  this.setState(id.replace(".on", ".state"), true, true); //Nachführung von state
                },
                (err) => {
                  this.log.error(`Cannot control: ${err}`);
                }
              );
            }
          } else if (dp === "off") {
            this.log.debug(`V5 Send to zone ${zone} off`);
            if (!this.checkMethod(zones[zone], "off")) {
              return;
            }
            light.sendCommands(zones[zone].off(zone)).then(
              () => {
                this.setState(id, false, true); //tastendruck rückgängig machen
                this.setState(id.replace("off", "state"), false, true); //Nachführung von state
              },
              (err) => {
                this.log.error(`Cannot control: ${err}`);
              }
            );
          } else if (dp === "nightMode" || dp === "whiteMode") {
            this.log.debug(`V5 Send to zone ${zone} Mode on`);
            if (
              !this.checkMethod(zones[zone], "on") ||
              !this.checkMethod(zones[zone], dp)
            ) {
              return;
            }
            light
              .sendCommands(zones[zone].on(zone), zones[zone][dp](zone))
              .then(
                () => {
                  this.setState(id, true, true); //status behalten?
                },
                (err) => {
                  this.log.error(`Cannot control: ${err}`);
                }
              );
          } else if (
            dp === "maxBright" ||
            dp === "brightUp" ||
            dp === "brightDown" ||
            dp === "speedUp" ||
            dp === "speedDown" ||
            dp === "effectSpeedUp" ||
            dp === "effectSpeedDown" ||
            dp === "effectModeNext" ||
            dp === "cooler" ||
            dp === "warmer"
          ) {
            this.log.debug(`V5 Send to zone ${zone} "${dp}": ${state.val}`);
            if (
              !this.checkMethod(zones[zone], "on") ||
              !this.checkMethod(zones[zone], dp)
            ) {
              return;
            }
            light.sendCommands(zones[zone].on(zone), zones[zone][dp]()).then(
              () => {
                this.setState(id, false, true); //tastendruck rückgängig machen
              },
              (err) => {
                this.log.error(`Cannot control: ${err}`);
              }
            );
          } else {
            this.log.error(`Unknown command: ${dp}`);
          }
        }
      }
    } else {
      // The state was deleted
      this.log.info(`state ${id} deleted`);
    }
  }

  /**
   * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
   * Using this method requires "common.messagebox" property to be set to true in io-package.json
   *
   * @param {ioBroker.Message} obj
   */
  onMessage(obj) {
    if (typeof obj === "object" && obj.message) {
      if (obj) {
        // e.g. send email or pushover or whatever
        this.log.info("send command");
        switch (obj.command) {
          case "browse":
            var discoverBridges =
              require("node-milight-promise").discoverBridges;
            this.log.info("Discover bridges...");
            discoverBridges({
              type: "all",
            }).then((results) => {
              this.log.info(`Discover bridges: ${JSON.stringify(results)}`);
              if (obj.callback) {
                this.sendTo(obj.from, obj.command, results, obj.callback);
              }
            });
            break;

          default:
            this.log.warn(`Unknown command: ${obj.command}`);
            break;
        }

        // Send response in callback if required
        if (obj.callback) {
          this.sendTo(obj.from, obj.command, "Message received", obj.callback);
        }
      }
    }
  }

  rgbToHsv(r, g, b) {
    r /= 0xff;
    g /= 0xff;
    b /= 0xff;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0;
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = Math.round(h * 60);
      s = Math.round(s * 100);
      v = Math.round(v * 100);
    }
    return [h, s, v];
  }
  hsvToRgb(h, s, v) {
    /**
     * HSV to RGB color conversion
     *
     * H runs from 0 to 360 degrees
     * S and V run from 0 to 100
     *
     * Ported from the excellent java algorithm by Eugene Vishnevsky at:
     * http://www.cs.rit.edu/~ncs/color/t_convert.html
     */
    var r, g, b;
    var i;
    var f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100
    s /= 100;
    v /= 100;

    if (s == 0) {
      // Achromatic (grey)
      r = g = b = v;
      let hex =
        Math.round(b * 255) |
        (Math.round(g * 255) << 8) |
        (Math.round(r * 255) << 16);
      return `#${(0x1000000 + hex).toString(16).slice(1)}`;
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;

      case 1:
        r = q;
        g = v;
        b = p;
        break;

      case 2:
        r = p;
        g = v;
        b = t;
        break;

      case 3:
        r = p;
        g = q;
        b = v;
        break;

      case 4:
        r = t;
        g = p;
        b = v;
        break;

      default:
        // case 5:
        r = v;
        g = p;
        b = q;
    }
    let hex =
      Math.round(b * 255) |
      (Math.round(g * 255) << 8) |
      (Math.round(r * 255) << 16);
    return `#${(0x1000000 + hex).toString(16).slice(1)}`;
  }
  checkMethod(zone, funcName) {
    if (
      zone &&
      typeof zone === "object" &&
      typeof zone[funcName] === "function"
    ) {
      return true;
    }
    var keys = [];
    if (typeof zone === "object") {
      for (var name in zone) {
        if (
          Object.prototype.hasOwnProperty.call(zone, name) &&
          typeof zone[name] === "function"
        ) {
          keys.push(name);
        }
      }
    }
    this.log.warn(
      `Property "${funcName}" does not exist. Please use on of ${keys.join(
        ", "
      )}`
    );
    return false;
  }

  splitColor(rgb) {
    if (!rgb) {
      rgb = "#000000";
    }
    rgb = rgb.toString().toUpperCase();
    if (rgb[0] === "#") {
      rgb = rgb.substring(1);
    }
    if (rgb.length < 6) {
      rgb = rgb[0] + rgb[0] + rgb[1] + rgb[1] + rgb[2] + rgb[2];
    }
    var r = parseInt(rgb[0] + rgb[1], 16);
    var g = parseInt(rgb[2] + rgb[3], 16);
    var b = parseInt(rgb[4] + rgb[5], 16);

    if (rgb.length >= 8) {
      return [r, g, b, parseInt(rgb[6] + rgb[7], 16)];
    }
    return [r, g, b];
  }

  mergeObject(obj, cb) {
    this.getForeignObject(obj._id, (err, _obj) => {
      if (_obj) {
        var changed = false;
        for (var attr in obj) {
          if (!Object.prototype.hasOwnProperty.call(obj, attr)) {
            continue;
          }

          if (typeof obj[attr] === "object") {
            for (var _attr in obj[attr]) {
              if (
                Object.prototype.hasOwnProperty.call(obj[attr], _attr) &&
                (!_obj[attr] || _obj[attr][_attr] !== obj[attr][_attr])
              ) {
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
          this.setForeignObject(obj._id, _obj, () => {
            cb && cb();
          });
        } else {
          cb && cb();
        }
      } else {
        this.setForeignObject(obj._id, obj, () => {
          cb && cb();
        });
      }
    });
  }

  mergeObjects(objs, cb) {
    if (!objs || !objs.length) {
      if (typeof cb === "function") {
        cb();
      }
      return;
    }
    this.mergeObject(objs.shift(), () => {
      setTimeout(this.mergeObjects, 0, objs, cb);
    });
  }
}
if (require.main !== module) {
  // Export the constructor in compact mode
  /**
   * @param {Partial<utils.AdapterOptions>} [options]
   */
  module.exports = (options) => new Milight(options);
} else {
  // otherwise start the instance directly
  new Milight();
}
