/*#################
V0.0.1 （测试的zigbee2mqtt的版本为 ： 1.37.1 commit: ea39d86）
弗雷克M2  遥控器
先横向左到右 再上到下 依次 button_01_click 到 button_16_click （没有button_15_click）
*/#################
const {} = require('zigbee-herdsman-converters/lib/modernExtend');
//
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const utils = require('zigbee-herdsman-converters/lib/utils');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
// const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const localDataPoints = {
    scene_controller: 2,
    switch_controller: 6,//开和关
    mode_controller: 7,
    bright_controller: 8,
    temp_controller: 9,
    color_controller: 10,
    button_mode_1: 21,
    button_mode_2: 22,
    button_mode_3: 23,
    button_mode_4: 24,
    button_mode_5: 25,
    button_mode_6: 26,
    button_mode_7: 27,
    button_mode_8: 28,
    scene_data: 30,
    scene_switch: 52 //按键1-8
};
const localFz = {
    commandOn: {
        cluster: 'genOnOff',
        type: ['commandOn'],
        convert: (model, msg, publish, options, meta) => {
            if (hasAlreadyProcessedMessage(msg, model)) return;
            const payload = {action: `button_01_click`};
            addActionGroup(payload, msg, model);
            return payload;  
        },
    },
    commandOff: {
        cluster: 'genOnOff',
        type: ['commandOff'],
        convert: (model, msg, publish, options, meta) => { 
            if (hasAlreadyProcessedMessage(msg, model)) return;
            const payload = {action: `button_02_click`};
            addActionGroup(payload, msg, model);
            return payload; 
        },
    },
    levelCtrl: {
        cluster: 'genLevelCtrl',
        type: ['commandStep'],
        convert: (model, msg, publish, options, meta) => {  
            if (hasAlreadyProcessedMessage(msg, model)) return;
            let payload;
            if( msg['data']['stepmode'] === 0) {
                payload = {action: `button_03_click`};
            }else{
                payload = {action: `button_04_click`};
            }
           addActionGroup(payload, msg, model);
            return payload;
        },
    },
    colorCtrl: {
        cluster: 'lightingColorCtrl',
        type: ['commandStepColorTemp'],
        convert: (model, msg, publish, options, meta) => {  
            if (hasAlreadyProcessedMessage(msg, model)) return;
            let payload;
            if(msg['data']['stepmode'] === 3) {
                payload = {action: `button_05_click`};
            }else{
                payload = {action: `button_06_click`};
            }
            addActionGroup(payload, msg, model);
            return payload;
        },
    },
    scene: {
        cluster: 'genOnOff',
        type: ['commandTuyaAction'],
        convert: (model, msg, publish, options, meta) => {    
            if (hasAlreadyProcessedMessage(msg, model)) return;
            const buttonLookup = {
                1: 'button_07',
                2: 'button_08',
                3: 'button_09',
                4: 'button_10',
                5: 'button_11',
                6: 'button_12',
                7: 'button_13',
                8: 'button_14',
            };
            const button = buttonLookup[ msg["data"]["data"][1] ];
            // return {action: `${ msg["data"]["data"] }`};
            let payload;
            if (button) {
                payload =  {action: `${button}_click`};
                // return {action: `${JSON.stringify(msg['data'])}`};
            }
             addActionGroup(payload, msg, model);
            return payload;
        },
    },
    on_off: {
        cluster: 'genOnOff',
        type: ['raw'],
        convert: (model, msg, publish, options, meta) => {    
            const buttonLookup = {
                1: 'button_07',
                2: 'button_08',
                3: 'button_09',
                4: 'button_10',
                5: 'button_11',
                6: 'button_12',
                7: 'button_13',
                8: 'button_14',
            };
            const button = buttonLookup[ msg["data"][5] ];
            // return {action: `${ msg["data"]["data"] }`};
            if (button) {
                return {action: `${button}_click`};
                // return {action: `${JSON.stringify(msg['data'])}`};
            }
        },
    },
    commandMoveToLevel: {
        cluster: 'genLevelCtrl',
        type: ['commandMoveToLevel'],
        convert: (model, msg, publish, options, meta) => {  
            if (hasAlreadyProcessedMessage(msg, model)) return;
            cosnt payload = {action: `button_16_click`};  
            addActionGroup(payload, msg, model);
            return payload;
        },
    },
    commandMoveToColorTemp: {
        cluster: 'lightingColorCtrl',
        type: ['commandMoveToColorTemp'],
        convert: (model, msg, publish, options, meta) => {       
            if (hasAlreadyProcessedMessage(msg, model)) return;
            return;  
        },
    }
    
};
const definition = {
    // Since a lot of TuYa devices use the same modelID, but use different datapoints
    // it's necessary to provide a fingerprint instead of a zigbeeModel
    fingerprint: [
        {
            // The model ID from: Device with modelID 'TS0601' is not supported
            // You may need to add \u0000 at the end of the name in some cases
            modelID: 'TS1002',
            // The manufacturer name from: Device with modelID 'TS0601' is not supported.
            manufacturerName: '_TZ3000_udhg6cgl',
        },
    ],
    model: 'M2',
    vendor: 'FORICK',
    description: '遥控器M2',
    fromZigbee: [localFz.on_off,localFz.commandOn,localFz.commandOff,localFz.levelCtrl,localFz.colorCtrl,localFz.commandMoveToLevel,localFz.commandMoveToColorTemp,localFz.scene],//,localFz.ctl
    toZigbee: [],//,localTz.ctl
    onEvent: tuya.onEventSetTime, // Add this if you are getting no converter for 'commandMcuSyncTime'
    configure: tuya.configureMagicPacket,
    exposes: [
        exposes.text('action', ea.STATE)
    ],
    meta: {
        // All datapoints go in here
        tuyaDatapoints: [
        //   [localDataPoints.scene_switch, 'action', tuya.valueConverter.raw],
          /*
          [101, 'illuminance_lux', tuya.valueConverter.raw],
          [2,'radar_sensitivity',tuya.valueConverter.raw],
          [localDataPoints.far_detection,'far_detection',tuya.valueConverter.raw],
          [localDataPoints.luxhighset,'luxhighset',tuya.valueConverter.raw],
          [localDataPoints.luxlowset,'luxlowset',tuya.valueConverter.raw],
          [localDataPoints.identify,'identify',tuya.valueConverter.raw],
          [localDataPoints.restorefactory,'restorefactory',tuya.valueConverter.raw],
          [localDataPoints.detectmode,'detectmode',tuya.valueConverter.raw],
          [localDataPoints.programfuns,'programfuns',tuya.valueConverter.raw],
          [localDataPoints.ledmode,'ledmode',tuya.valueConverter.raw],
          [localDataPoints.ifluxsensorwork,'ifluxsensorwork',tuya.valueConverter.raw],
          [localDataPoints.daynighttime,'daynighttime',tuya.valueConverter.raw],*/
        ],
    },
};

module.exports = definition;
