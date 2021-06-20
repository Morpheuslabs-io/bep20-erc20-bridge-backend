"use strict"

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;

const BaseComponent = function () { }
inherits(BaseComponent, EventEmitter);

BaseComponent.prototype.log = function () {
    const date = new Date().toISOString();
    const args = Array.from(arguments);
    const prefix = `${date} [${this.constructor.name}]`;
    args.unshift(prefix);
    console.log.apply(console, args);
}

BaseComponent.prototype.info = function () {
    this.log(arguments);
}

module.exports = BaseComponent;
