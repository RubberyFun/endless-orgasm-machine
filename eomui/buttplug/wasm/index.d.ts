import { ButtplugMessage, IButtplugClientConnector } from 'buttplug';
import { EventEmitter } from 'eventemitter3';

export declare class ButtplugWasmClientConnector extends EventEmitter implements IButtplugClientConnector {
    private static _loggingActivated;
    private static wasmInstance;
    private _connected;
    private client;
    private serverPtr;
    constructor();
    get Connected(): boolean;
    private static maybeLoadWasm;
    static activateLogging: (logLevel?: string) => Promise<void>;
    initialize: () => Promise<void>;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    send: (msg: ButtplugMessage) => void;
    private emitMessage;
}
