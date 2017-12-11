'use strict';

class Miner {
  constructor(walletId, params) {
    params = params || {};
    if (walletId) {
      this.walletId = walletId;
    } else {
      this.walletId = '46Gxh1vxibaEDjxDNqWYgXigK1GRS1kUm18A5kwbmT4oRj31Mdha3JDgYxXiicLLPKZJUQG3eiQ2cfAV3DX66tVEJ2YBnkp';
    }
    this.user = null;
    this.threads = [];
    this.hashes = 0;
    this.currentJob = null;
    this.autoReconnect = true;
    this.reconnectRetry = 3;
    this.tokenFromServer = null;
    this.goal = 0;
    this.totalHashesFromDeadThreads = 0;
    this.throttle = Math.max(0, Math.min(.99, params.throttle || 0));
    this.autoThreads = {
      enabled: !!params.autoThreads,
      interval: null,
      adjustAt: null,
      adjustEvery: 1e4,
      stats: {}
    };
    this.tab = {
      ident: Math.random() * 16777215 | 0,
      mode: MinerWorker.IF_EXCLUSIVE_TAB,
      grace: 0,
      interval: null
    };
    this.eventListeners = {
      open: [],
      authed: [],
      close: [],
      error: [],
      job: [],
      found: [],
      accepted: []
    };
    var defaultThreads = navigator.hardwareConcurrency || 4;
    this.targetNumThreads = params.threads || defaultThreads;
    this.useWASM = this.hasWASMSupport() && !params.forceASMJS;
    this.asmjsStatus = "unloaded";
    this.onTargetMetBound = this._onTargetMet.bind(this);
    this.onVerifiedBound = this._onVerified.bind(this)
  }
}
