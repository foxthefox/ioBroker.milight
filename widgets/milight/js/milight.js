/*
    ioBroker.milight Widget-Set
    version: "0.0.3"
    Copyright foxthefox 
    adapted from iobroker.vis-jqui, jqui-mfd

*/

"use strict";

function hsvToRgb(h, s, v) {
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
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function temp2rgb(kelvin) {
    var b, g, r, temp;
    temp = kelvin / 100;
    if (temp < 66) {
      r = 255;
      g = -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * Math.log(g);
      b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * Math.log(b);
    } else {
      r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * Math.log(r);
      g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * Math.log(g);
      b = 255;
    }
    return [Math.round(r), Math.round(g), Math.round(b)];
};
function rgbToHex(value) {
    var tmp = value.split(',');
    var r = tmp[0];
    var g = tmp[1];
    var b = tmp[2];
    var hex = b | (g << 8) | (r << 16);
    return '#' + (0x1000000 + hex).toString(16).slice(1)
}

// add translations for edit mode

if (vis.editMode) {
    $.extend(systemDictionary, {
        "oid-level":        {"en": "brightness",    "de": "Helligkeit"},
        "oid-colormode":    {"en": "mode switch",   "de": "Modus Schalter"},
        "oid-color":        {"en": "color value",    "de": "Farbewert"},
        "oid-disco":        {"en": "disco mode",    "de": "Disco mode"},
        "oid-speedup":      {"en": "speed up",      "de": "speed up"},
        "oid-speeddown":    {"en": "speed down",    "de": "speed down"},
        "oid-discospeeddown": {"en": "speed down", "de": "speed down"},
        "oid-discospeedup": {"en": "speed up",      "de": "speed up"},
        "oid-ctemp": {"en": "white color temp", "de": "weiß Farbtemperatur"},
        "oid-saturation": {"en": "color saturation", "de": "Farbsättigung"},
        "oid-mode": {"en": "Effect Mode switch", "de": "Effect Modus Schalter"},
    });
}

vis.binds.milightui = {

    version: "0.0.3",

    showVersion: function() {

        if (vis.binds.milightui.version) {
            console.log('Milight widget version: ' + vis.binds.milightui.version);
            vis.binds.milightui.version = null;
        }
    },
    //; vis.binds.musiccast.buttonToggle(el, data.value)
    buttonToggle: function (el, val) {
        var $this = $(el);
        var oid = $this.attr('data-oid');

        if (!$(el).data('no-style')) {
            setTimeout(function () {
                $(el).button();
            }, 0);
        }
        $(el).click(function () {
            if (val === undefined || val === null) val = false;
            if (val === 'true')  val = true;
            if (val === 'false') val = false;
            if (parseFloat(val).toString() == val) val = parseFloat(val);
            if (!vis.editMode) vis.setValue(oid, val);
        });
    },
    state: function (el, oid) {
        var $this = $(el);
        var oid = (oid ? oid : $this.attr('data-oid'));
        var val = $this.attr('data-val');

        if (oid) $this.attr('data-oid', oid);

        if (val === 'true')  val = true;
        if (val === 'false') val = false;

        if (!vis.editMode) {
            $this.on('click touchstart', function (e) {
                // Protect against two events
                if (vis.detectBounce(this)) return;

                var oid = $(this).attr('data-oid');

                if ($(this).attr('url-value')) {
                    vis.conn.httpGet($(this).attr('url-value'));
                }

                if (oid) {
                    var val = $(this).attr('data-val');
                    if (val === undefined || val === null) val = false;
                    if (val === 'true')  val = true;
                    if (val === 'false') val = false;
                    if (parseFloat(val).toString() == val) val = parseFloat(val);

                    if (oid) vis.setValue(oid, val);
                }
            });
        }
    },
    hueslider: function (el, options) {
        var $this = $(el);
        var oid = $this.attr('data-oid');
        var oid_val = 0;
        var wid = $this.attr("data-oid-working");
        var settings = $.extend({
            range: false,
            min: 0,
            max: 100,
            step: 1,
            value: parseFloat(vis.states.attr(oid + '.val')),
            slide: function (e, ui) {
                // Slider -> Observable
                vis.setValue(oid, ui.value); //.toFixed(6));
                
                var rgb = "255, 255, 255";
                var v = ui.value;
                if (v < 256) {
                    var c1 = (Math.floor((v / 255.0 * 359.0) % 360) - 240);
                    var color = c1 <= 0 ? Math.abs(c1) : 360 - c1;
                    rgb = hsvToRgb(color, 80, 100).join();
                    $this.slider().css("background-color", "rgb("+ rgb +")");
                }
                
            }
        }, options);

        if (isNaN(settings.value)) settings.value = 0;
        if (isNaN(settings.min))   settings.min = 0;
        if (isNaN(settings.max))   settings.max = 100;
        if (isNaN(settings.step))  settings.step = (settings.max - settings.min) / 100;

        settings.min = parseFloat(settings.min);
        settings.max = parseFloat(settings.max);
        settings.value = parseFloat(settings.value);

        $this.slider(settings);
        var rgb = "255, 255, 255";
        var v = settings.value;
        if (v < 256) {
            var c1 = (Math.floor((v / 255.0 * 359.0) % 360) - 240);
            var color = c1 <= 0 ? Math.abs(c1) : 360 - c1;
            rgb = hsvToRgb(color, 80, 100).join();
            $this.slider().css("background-color", "rgb(" + rgb + ")");
        } 

        vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
            //console.log("slider newVal=" +JSON.stringify(newVal));
            // If device not in working state
            if (!vis.states.attr(wid + '.val')) {
                
                oid_val = parseFloat(newVal);
                
                var rgb = "255, 255, 255";
                var v = oid_val;
                if (v < 256) {
                    var c1 = (Math.floor((v / 255.0 * 359.0) % 360) - 240);
                    var color = c1 <= 0 ? Math.abs(c1) : 360 - c1;
                    rgb = hsvToRgb(color, 80, 100).join();
                    $this.slider().css("background-color", "rgb(" + rgb + ")");
                } 
                    
                if ($this.slider('instance')) {
                    $this.slider('value', oid_val);
                }
            }
        });
    },
    hueslider1: function (el, options) {
        var $this = $(el);
        var oid = $this.attr('data-oid');
        var oid_val = 0;
        var wid = $this.attr("data-oid-working");
        var settings = $.extend({
            range: false,
            min: 0,
            max: 360,
            step: 1,
            value: parseFloat(vis.states.attr(oid + '.val')),
            slide: function (e, ui) {
                // Slider -> Observable
                vis.setValue(oid, ui.value); //.toFixed(6));
                
                var rgb = "255, 255, 255";
                var v = ui.value;
                rgb = hsvToRgb(v, 80, 100).join();
                    $this.slider().css("background-color", "rgb("+ rgb +")");
                
            }
        }, options);

        if (isNaN(settings.value)) settings.value = 0;
        if (isNaN(settings.min))   settings.min = 0;
        if (isNaN(settings.max))   settings.max = 360;
        if (isNaN(settings.step))  settings.step = (settings.max - settings.min) / 100;

        settings.min = parseFloat(settings.min);
        settings.max = parseFloat(settings.max);
        settings.value = parseFloat(settings.value);

        $this.slider(settings);
        var rgb = "255, 255, 255";
        var v = settings.value;
            rgb = hsvToRgb(v, 80, 100).join();
            $this.slider().css("background-color", "rgb(" + rgb + ")");

        vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
            //console.log("slider newVal=" +JSON.stringify(newVal));
            // If device not in working state
            if (!vis.states.attr(wid + '.val')) {
                
                oid_val = parseFloat(newVal);
                
                var rgb = "255, 255, 255";
                var v = oid_val;
                    rgb = hsvToRgb(v, 80, 100).join();
                    $this.slider().css("background-color", "rgb(" + rgb + ")");

                if ($this.slider('instance')) {
                    $this.slider('value', oid_val);
                }
            }
        });
    },
    ctslider: function (el, options) {
        var $this = $(el);
        var oid = $this.attr('data-oid');
        var oid_val = 0;
        var wid = $this.attr("data-oid-working");
        var settings = $.extend({
            range: false,
            min: 0,
            max: 100,
            step: 1,
            value: parseFloat(vis.states.attr(oid + '.val')),
            slide: function (e, ui) {
                // Slider -> Observable

                vis.setValue(oid, ui.value); //.toFixed(6));

                var color = "255, 255, 255";
                color = temp2rgb(ui.value);
                // Set the slider background color
                $this.slider().css("background-color", "rgb(" + color + ")");
            }
        }, options);

        if (isNaN(settings.value)) settings.value = 0;
        if (isNaN(settings.min))   settings.min = 0;
        if (isNaN(settings.max))   settings.max = 100;
        if (isNaN(settings.step))  settings.step = (settings.max - settings.min) / 100;

        settings.min = parseFloat(settings.min);
        settings.max = parseFloat(settings.max);
        settings.value = parseFloat(settings.value);

        $this.slider(settings);

        var color = "255, 255, 255";
        color = temp2rgb(settings.value);
        // Set the slider background color
        $this.slider().css("background-color", "rgb(" + color + ")");

        vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
            //console.log("slider newVal=" +JSON.stringify(newVal));
            // If device not in working state
            if (!vis.states.attr(wid + '.val')) {
                
                oid_val = parseFloat(newVal);
                
                var color = "255, 255, 255";
                color = temp2rgb(oid_val);
                // Set the slider background color
                $this.slider().css("background-color", "rgb(" + color + ")");
                    
                if ($this.slider('instance')) {
                    $this.slider('value', oid_val);
                }
            }
        });
    },
    milightColormode: function (el, oid) {
        var $hue = $(el).parent().find('.hue-mode-hue');
        if (vis.states.attr(oid + '.val') === 'ct' || vis.states.attr(oid + '.val') == 0 ) {
            $hue.hide();
        } else {
            $hue.show();
        }

        vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
            if (newVal === 'ct') {
                $hue.hide();
            } else {
                $hue.show();
            }
        });
    },
    milightRGBWWColormode: function (el, oid) {
        var $hue = $(el).parent().find('.hue-mode-hue');
        var $ct  = $(el).parent().find('.hue-mode-ct');
        if (vis.states.attr(oid + '.val') == 0) {
            $hue.hide();
            $ct.show();
        } else {
            $ct.hide();
            $hue.show();
        }

        vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
            if (newVal == 0 ) {
                $hue.hide();
                $ct.show();
            } else {
                $ct.hide();
                $hue.show();
            }
        });
    }
};

vis.binds.milightui.showVersion();
