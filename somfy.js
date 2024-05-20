const {} = require('zigbee-herdsman-converters/lib/modernExtend');
//
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const ota = require('zigbee-herdsman-converters/lib/ota');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
// const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;

const xiaomiExtend = {
    light_onoff_brightness_colortemp: (options={disableColorTempStartup: true}) => ({
        ...extend.light_onoff_brightness_colortemp(options),
        fromZigbee: extend.light_onoff_brightness_colortemp(options).fromZigbee.concat([
            fz.xiaomi_bulb_interval, fz.ignore_occupancy_report, fz.ignore_humidity_report,
            fz.ignore_pressure_report, fz.ignore_temperature_report,
        ]),
    }),
};

const definition = {
    zigbeeModel: ['1822647'],
    model: '1822647A',
    vendor: 'SOMFY',
    description: 'Zigbee smart plug',
    fromZigbee: [fz.on_off, fz.metering],
    toZigbee: [tz.on_off],
    exposes: [e.switch(), e.power(), e.energy()],
    configure: async (device, coordinatorEndpoint, logger) => {
        const ep = device.getEndpoint(12);
        await reporting.bind(ep, coordinatorEndpoint, ['genBasic', 'genIdentify', 'genOnOff', 'seMetering']);
        await reporting.onOff(ep, {min: 1, max: 3600, change: 0});
        await reporting.readMeteringMultiplierDivisor(ep);
        await reporting.instantaneousDemand(ep);
        await reporting.currentSummDelivered(ep);
        await reporting.currentSummReceived(ep);
    },
};

module.exports = definition;
