# utools-redis-client
utools插件-redis高性能客户端

![](https://s2.loli.net/2021/12/10/CAGUnwNiZDhHps1.png)
![](https://s2.loli.net/2021/12/10/YKOeFCpEfMhLgIs.png)
![](https://s2.loli.net/2021/12/10/gniMHxzlo5wusvY.png)
### 构建 - 运行
```
npm install

**uTools 开发者工具** 中将 `plugin.json` 加入到本地开发
```
### 功能说明
1.实现了最常用的get、set、del、hset、hget、hetall、psubscribe功能</br>
2.实现了直接执行redis指令的功能，如:</br>
```
  get key
  scan 0
  keys pre*
  ...
```
3.实现了subscribe订阅功能，并支持频道通配</br>
4.快速选择数据库
