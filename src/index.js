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

export default {
  'middleware.before': function(args) {
    let file = args.query.file;
    if (!file) {
      file = join(cwd, 'milk.js');
    } else if (file[0] !== '/') {
      file = join(cwd, file);
    }
    if (!existsSync(file)) {
      throw new Error(`dora-plugin-milk: milk file '${file}' not found.`);
    }
    milkHandler = require(file);
  },
  'middleware': function() {
    return function*(next) {
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