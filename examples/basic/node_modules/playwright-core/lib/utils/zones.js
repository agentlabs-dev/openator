"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zones = exports.Zone = void 0;
var _async_hooks = require("async_hooks");
/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class ZoneManager {
  constructor() {
    this._asyncLocalStorage = new _async_hooks.AsyncLocalStorage();
    this._emptyZone = Zone.createEmpty(this._asyncLocalStorage);
  }
  run(type, data, func) {
    return this.current().with(type, data).run(func);
  }
  zoneData(type) {
    return this.current().data(type);
  }
  current() {
    var _this$_asyncLocalStor;
    return (_this$_asyncLocalStor = this._asyncLocalStorage.getStore()) !== null && _this$_asyncLocalStor !== void 0 ? _this$_asyncLocalStor : this._emptyZone;
  }
  empty() {
    return this._emptyZone;
  }
}
class Zone {
  static createEmpty(asyncLocalStorage) {
    return new Zone(asyncLocalStorage, new Map());
  }
  constructor(asyncLocalStorage, store) {
    this._asyncLocalStorage = void 0;
    this._data = void 0;
    this._asyncLocalStorage = asyncLocalStorage;
    this._data = store;
  }
  with(type, data) {
    return new Zone(this._asyncLocalStorage, new Map(this._data).set(type, data));
  }
  without(type) {
    const data = type ? new Map(this._data) : new Map();
    data.delete(type);
    return new Zone(this._asyncLocalStorage, data);
  }
  run(func) {
    return this._asyncLocalStorage.run(this, func);
  }
  data(type) {
    return this._data.get(type);
  }
}
exports.Zone = Zone;
const zones = exports.zones = new ZoneManager();