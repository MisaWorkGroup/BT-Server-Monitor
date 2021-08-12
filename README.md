# BT-Server-Monitor
一个基于宝塔面板 API 的服务器状态监控面板

演示：https://status.misaliu.top/ *（演示站使用 `Another` 分支搭建）*

## 特点

- 使用 PHP 制作，部署简单
- 使用宝塔 API，无需部署其他环境
- 漂亮的自适应 Material Design 样式（来自 [MDUI](https://mdui.org)）

## `Main` 和 `Another` 的区别
可能已经有人看到本仓库还有一个 `Another` 分支，这里简单讲一下 `Another` 和 `Main` 的区别：

`Main` 使用一台服务器聚合所有信息，`Another` 则使用客户端分别向服务器请求信息。

所以，如果你的各个服务器之间通讯缓慢，推荐你使用 `Another` 分支，否则直接使用 `Main` 分支即可。

## 安装
1. 登录你服务器的宝塔面板，点击 `设置`；
2. 打开 `API 接口` 开关，记录对应密钥，然后在 `IP 白名单` 中填写主服务器的 IP，保存；
3. 下载本仓库源码，打开 `/src/get.php`，将你希望显示的服务器名称、服务器的面板地址 *（带端口号，不带入口地址）* 、服务器的 APIKEY 填写进对应的数组位置，保存；
4. 将 `/src` 下的所有文件都上传至主服务器，配置好网站即可正常运作~

## 一些问题
...我想不出来，等有人提 issue 我再更新吧233

## 鸣谢
- [宝塔面板](https://bt.cn)
- [zdhxiong/MDUI](https://github.com/zdhxiong/mdui)
