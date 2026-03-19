import { EventEmitter } from 'eventemitter3';
import { ButtplugClientDeviceFeature } from './ButtplugClientDeviceFeature';
import { DeviceOutputCommand } from './ButtplugClientDeviceCommand';
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
    private _features;
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
    get features(): Map<number, ButtplugClientDeviceFeature>;
    static fromMsg(msg: Messages.DeviceInfo, sendClosure: (msg: Messages.ButtplugMessage) => Promise<Messages.ButtplugMessage>): ButtplugClientDevice;
    /**
     * @param _index Index of the device, as created by the device manager.
     * @param _name Name of the device.
     * @param allowedMsgs Buttplug messages the device can receive.
     */
    private constructor();
    send(msg: Messages.ButtplugMessage): Promise<Messages.ButtplugMessage>;
    protected sendMsgExpectOk: (msg: Messages.ButtplugMessage) => Promise<void>;
    protected isOutputValid(featureIndex: number, type: Messages.OutputType): void;
    hasOutput(type: Messages.OutputType): boolean;
    hasInput(type: Messages.InputType): boolean;
    runOutput(cmd: DeviceOutputCommand): Promise<void>;
    stop(): Promise<void>;
    battery(): Promise<number>;
    emitDisconnected(): void;
}
