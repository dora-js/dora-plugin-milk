# dora-plugin-milk

快捷加载自定义中间件的轻量 dora 插件，方便在不创建 npm 包的情况下快捷添加自定义中间件。

----

## Usage

* 在项目根目录里添加 `milk.js` 文件.
* 编辑该 `milk.js` 文件, 内容是一个 koa 中间件.

````js
module.exports = function*(next) {
  // do anything you like
  this.body = 'hello milk';
  yield next;
}
````

* 执行 dora 时指定加载 milk 插件.

```bash
$ dora --plugins milk
# 通过 file 参数来指定文件
$ dora --plugins milk?file=~/somePath/milk.js
# 通过 watch 参数来监控文件变化自动重新加载
$ dora --plugins milk?watch=true
```



