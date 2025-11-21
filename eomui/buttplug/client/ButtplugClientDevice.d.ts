import { EventEmitter } from 'eventemitter3';
/*!
 * Buttplug JS Source Code File - Visit https://buttplug.io for more info about
 * the project. Licensed under the BSD 3-Clause license. See LICENSE file in the
 * project root for full license information.
 *
 * @copyright Copyright (c) Nonpolynomial Labs LLC. All rights reserved.
 */
import * as Messages from '../core/Messages';
/**
 * Represents an abstract device, capable of taking certain kinds of messages.
 */
export declare class ButtplugClientDevice extends EventEmitter {
    private _deviceInfo;
    private _sendClosure;
    /**
     * Return the name of the device.
     */
    get name(): string;
    /**
     * Return the user set name of the device.
     */
    get displayName(): string | undefined;
    /**
     * Return the index of the device.
     */
    get index(): number;
    /**
     * Return the index of the device.
     */
    get messageTimingGap(): number | undefined;
    /**
     * Return a list of message types the device accepts.
     */
    get messageAttributes(): Messages.MessageAttributes;
    static fromMsg(msg: Messages.DeviceInfo, sendClosure: (device: ButtplugClientDevice, msg: Messages.ButtplugDeviceMessage) => Promise<Messages.ButtplugMessage>): ButtplugClientDevice;
    private allowedMsgs;
    /**
     * @param _index Index of the device, as created by the device manager.
     * @param _name Name of the device.
     * @param allowedMsgs Buttplug messages the device can receive.
     */
    constructor(_deviceInfo: Messages.DeviceInfo, _sendClosure: (device: ButtplugClientDevice, msg: Messages.ButtplugDeviceMessage) => Promise<Messages.ButtplugMessage>);
    send(msg: Messages.ButtplugDeviceMessage): Promise<Messages.ButtplugMessage>;
    sendExpectOk(msg: Messages.ButtplugDeviceMessage): Promise<void>;
    scalar(scalar: Messages.ScalarSubcommand | Messages.ScalarSubcommand[]): Promise<void>;
    private scalarCommandBuilder;
    get vibrateAttributes(): Messages.GenericDeviceMessageAttributes[];
    vibrate(speed: number | number[]): Promise<void>;
    get oscillateAttributes(): Messages.GenericDeviceMessageAttributes[];
    oscillate(speed: number | number[]): Promise<void>;
    get rotateAttributes(): Messages.GenericDeviceMessageAttributes[];
    rotate(values: number | [number, boolean][], clockwise?: boolean): Promise<void>;
    get linearAttributes(): Messages.GenericDeviceMessageAttributes[];
    linear(values: number | [number, number][], duration?: number): Promise<void>;
    sensorRead(sensorIndex: number, sensorType: Messages.SensorType): Promise<number[]>;
    get hasBattery(): boolean;
    battery(): Promise<number>;
    get hasRssi(): boolean;
    rssi(): Promise<number>;
    rawRead(endpoint: string, expectedLength: number, timeout: number): Promise<Uint8Array>;
    rawWrite(endpoint: string, data: Uint8Array, writeWithResponse: boolean): Promise<void>;
    rawSubscribe(endpoint: string): Promise<void>;
    rawUnsubscribe(endpoint: string): Promise<void>;
    stop(): Promise<void>;
    emitDisconnected(): void;
}
