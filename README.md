# utools-redis-client
utools插件-redis高性能客户端

![4A766C411CCB0253947C3BA8CFA3963D](https://github.com/antonieyang/github-pic/blob/main/utools/utools-redis-client.png?raw=true)

### 构建 - 运行
```
npm install

**uTools 开发者工具** 中将 `public/plugin.json` 加入到本地开发
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
3.实现了subscribe订阅功能，并支持频道通配
