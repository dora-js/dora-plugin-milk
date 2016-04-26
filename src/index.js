import { join } from 'path';
import fs from 'fs';

require('babel-register');
require('babel-polyfill');

// fs.existsSync has be Deprecated after v
const existsSync = fs.existsSync ? fs.existsSync : function(file) {
  try {
    fs.accessSync(file);
    return true;
  } catch (ex) {
    return false;
  }
};

let milkHandler = null;
const cwd = process.cwd();
let changeTimeout = null;

function dealChange(file) {
  changeTimeout = null;
  delete require.cache[require.resolve(file)];
  milkHandler = require(file);
  console.log(`dora-plugin-milk: milk file '${file}' changed and reloaded.`);
}

export default {
  'middleware.before': *function() {
    let file = this.query.file;
    if (!file) {
      file = join(cwd, 'milk.js');
    } else if (file[0] !== '/') {
      file = join(cwd, file);
    }
    if (!existsSync(file)) {
      throw new Error(`dora-plugin-milk: milk file '${file}' not found.`);
    }
    milkHandler = yield require(file);
    if (this.query.watch) {
      fs.watch(file, {persistent: false}, function() {
        if (changeTimeout) {
          clearTimeout(changeTimeout);
        }
        // 延迟 500ms 重新加载 milk.js 文件
        changeTimeout = setTimeout(dealChange.bind(this, file), 500);
      });
    }
  },
  'middleware': function() {
    return function *(next) {
      if (typeof milkHandler !== 'function') {
        this.body = milkHandler;
        yield next;
        return;
      }
      try {
        if (milkHandler.constructor.name === 'GeneratorFunction') {
          yield milkHandler.call(this, next);
        } else {
          milkHandler.call(this, next);
        }
      } catch (err) {
        this.body = err.stack;
        yield next;
      }
    }
  }
}
