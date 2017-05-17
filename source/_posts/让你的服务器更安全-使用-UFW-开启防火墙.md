---
title: 让你的服务器更安全 - 使用 UFW 开启防火墙
date: 2017-05-20 09:58:52
categories: Linux
tags:
    - Linux
    - Ubuntu
    - Firewall
    - UFW
    - Security
---

`UFW`(Uncomplicated Firewall) 是一个非常容易上手的 `iptables` 类防火墙配置工具，这个工具可以对出入服务的网络数据进行分割、过滤、转发等等细微的控制，进而实现诸如防火墙、 `NAT` 等功能。它简化了 `iptable` 那复杂的配置过程。我们都知道 `iptable` 非常强大、灵活，但是对于初学者来学习如何使用它正确的配置防火墙是比较难的，但是你又想保护你的网络，`UFW` 将会是你最好的选择。

下面我将会解释如何在 `Ubuntu 14.04` 中使用 `UFW` 安装、配置防火墙。

## 使用前提

在你使用这片教材之前，我希望你有一个独立的 `no-root` 超级管理员用户 - 拥有 `root` 的所有权限。你可以查看我这篇文章 [让你的服务器更安全 - 初始化服务器配置](/2017/05/20/让你的服务器更安全-初始化服务器配置/) 中创建用户相关步骤。

一般来说 `UFW` 是默认会被安装的，假如你的系统中没有安装，你可以使用 `apt-get` 来安装。

```bash
$ sudo apt-get install ufw
```

## 使用 IPv6

如果你的 `Ubuntu` 服务器已启用 `IPv6`，为了确保 `UFW` 能支持 `IPv6` 协议。

打开 `UFW` 的相关配置，使用你最喜欢的编辑器，这里我使用 `vim` ：

```bash
$ vim /etc/default/ufw
```

然后，确认 `IPv6` 是否设置成 `yes`，如果没有则设置为 `yes`，大致如下：

```bash
...
IPV6=yes
...
```

退出并保存，当 `UFW` 开启时，它将会同时支持 `IPv4` 和 `IPv6` 的配置规则。

## 查看 UFW 状态和配置规则

在任何时间，你都可以检查它的状态和配置规则，如下：

```bash
$ sudo ufw status verbose
```

默认情况下，`UFW` 并没有开启，它将会输出如下结果：

```bash
# Output:
Status: inactive
```

假如你已经开启了防火墙，它将会输出状态为 `active`，并列出你所配置的规则。例如：你允许来自任何地方的 `SSH` 连接，将将会输出如下结果：

```bash
# Output
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
```

像这样通过 `status` 就可以检查你的防火墙状态和配置了。

> **注意：在开启防火墙之前，你需要确保你允许了 SSH 连接，否则当你关闭远程连接后，你就无法再连上了。博主自己就曾用这招坑了自己！:joy:**

## 设置默认规则

当你需要开始配置你的防火墙规则时，首先，你需要设置默认规则：拒绝所有流入连接，允许流出连接。意思是，不允许任何人连接你的主机，允许主机内的任何应用访问外部网络。

```bash
$ sudo ufw default deny incoming
$ sudo ufw default allow outgoing
```

## 开启 SSH 连接

上面我们已经设置了默认不接受任何外来连接，同样也包括了 `SSH` 使用的 `22` 端口。所以，为了我们能通过 `SSH` 来操作主机，所以我们需要配置允许 `SSH` 连接到我们的主机上。

通过如下命令来配置：

```shell
$ sudo ufw allow ssh
```

这个配置将会允许所有 `22` 端口上的连接，默认 `22` 端口是被 `SSH` 监听的。`UFW` 知道什么是 `ssh`，因为它在 `/etc/services` 中已经被定义好了。

当然我们也可以指定允许 `22` 端口的所有连接：

```bash
$ sudo ufw allow 22
```

这个和上面一个命令的作用是一样的。

## 开启 UFW

上面已经允许 `SSH` 连接，我们就可以放心的开启防火墙了，使用如下命令：

```bash
$ sudo ufw enable
```

在这个过程中，你将会收到一条警告信息（`command may disrupt existing ssh connections.`），需要你手动确认，输入 `y` 按回车即可。

:smile: 太棒了，我们已经开启了防火墙，你可以再一次通过 `sudo ufw status verbose` 来查看。

## 配置其他规则

### HTTP/HTTPS

当我们部署 `WEB` 引用服务器时，我们需要使用 `80` 或 `443` 端口来接受请求，这是我们需要开启这两个端口，操作如下：

```bash
$ sudo ufw allow http
$ sudo ufw allow https
```

或者，你可以指定端口：

```bash
$ sudo ufw allow 80
$ sudo ufw allow 443
```

### FTP

`FTP` 连接一般用于非加密文件传输，它默认监听 `21` 端口，也许你永远都不会用到。

```bash
$ sudo ufw allow ftp
```

或者，你可以指定端口：

```bash
$ sudo ufw allow 21/tcp
```

## 指定端口范围

你可以指定一个端口范围，来配置防火墙策略，当有些服务需要使用多个端口时，这个就起到了作用。

如，为了允许所有 `X11` 连接，他们使用的端口范围是 `6000` ~ `6007`，你可以这样配置：

```bash
$ sudo ufw allow 6000:6007/tcp
$ sudo ufw allow 6000:6007/udp
```

> **指定端口范围时，你必须指定协议类型（`TCP` 或 `UDP`）。**

## 指定 IP 地址

使用 `UFW` 工作的时候，你可以指定 `IP` 地址，例如：假如你想允许来自某一个 `IP` 所有连接，你可以指定 `from` 这个 `IP` 地址。

```bash
$ sudo ufw allow from 192.168.66.213
```

上面的配置将会允许 `192.168.66.213` 连接到我们主机的任何开放了的端口。

我们还可以指定只允许某个 `IP` 到主机某一个端口的连接，拒绝某个 `IP` 到主机其他所有端口的连接，我们可以这样做：

```bash
$ sudo ufw allow from 192.168.66.213 to any port 80
```

上面配置中，我们只允许 `192.168.66.213` 连接到我们的 `80` 端口。

## 配置子网

当你需要允许子网内所有的 `IP`，你可以 `CIDR` 的格式来配置，例如：当你需要允许 `IP` 地址从 `192.168.1.1` 到 `192.168.1.254` 内所有 `IP` 的连接时，你可以这样配置：

```bash
$ sudo ufw allow from 192.168.1.1/24
```

当然，像上面一样，我们也可以同时指定端口号：

```bash
$ sudo ufw allow from 192.168.1.1/24 to any port 22
```

上面配置中，我们允许 `192.168.1.1/24` 内的所有主机通过 `SSH` 连接我们的主机。

## 指定网络接口

如果您想创建只适用于特定网络接口的防火墙规则，您可以通过指定 `allow in on` 加上**网络接口的名称** 来配置规则。

在配置之前你可以先查找所有的网络接口，再配置：

```bash
$ ip addr
```

```bash
# Output Excerpt:
...
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state
...
3: eth1: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default 
...
```

上面列举了网络接口的一些信息，他们通常叫做 `eth0` 或 `eth1` 之类的名字。

假如你的 `eth0` 为公网地址，你同事需要向外开放 `80` 端口，你可以如下操作：

```bash
$ sudo ufw allow in on eth0 to any port 80 
```

上面配置中，你的服务器将会接受来自于公网的 HTTP 请求。

另外，假如你想你的 `MySQL` 服务器（监听 `3306`）只接受通过内网网卡 `eth1` 的请求，你可以这样：

```bash
$ sudo ufw allow in on eth1 to any port 3306 
```

如上配置中，只有在用一个内网中的服务器才能连接你的 `MySQL` 服务器。

## 添加拒绝连接规则

假如你没有修改过我们上面设置过的默认规则，它将会拒绝所有的外来连接，通常情况下，这样大大的简化了你配置一系列的防火墙规则，比如要求你创建指定端口啊，指定 `IP` 啊等等。但是，如果你想拒绝某个 `IP` 源或者某个网段的特定连接；也许你知道攻击源就来自于某个 `IP` 或某个网段；再者，你想把默认外接规则(incomming rule) 设置为 **allow**，这是你就需要指定某些拒绝规则了。

配置 *拒绝规则* ，更我们上面配置 *允许规则* 是一样的方式，只不过将 `allow` 改为 `deny`。

如：拒绝所有 HTTP 连接，即：拒绝所有连接 `80` 端口。

```bash
sudo ufw deny http
```

当然，也可以指定端口号：

```bash
sudo ufw deny 80
```

拒绝某一个 `192.168.1.10` 通过 `SSH` 连接到我们的主机上：

```bash
$ sudo ufw deny from 192.168.1.10 to any port 22
```

如果你想书写更多的 *拒绝规则* ，请参考之前描述的 *允许规则* 书写方式，将 `allow` 改为 `deny` 即可。

现在我们知道如何添加 *允许规则* 和 *拒绝规则*，但是我们还不知道如何删除规则，没关系，我们再往下看。

## 删除规则

众所周知，如何删除一条防火墙规则和如何创建一条防火墙规则一样重要，`UFW` 提供了两种路径删除他们：

- [通过规则序号来删除](#指定规则序号删除)
- [通过实际规则来删除](#指定实际规则删除)

### 指定规则序号删除

每一个规则在创建时都会分配一个序号，你可以将它理解为数据库的自增 `ID` 吧，可以通过他来进行更方便的操作，你可以通过如下方式查看序号：

```bash
sudo ufw status numbered
```

```bash
Numbered Output:
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22                         ALLOW IN    15.15.15.0/24
[ 2] 80                         ALLOW IN    Anywhere
```

假如你想删除第 `2` 条规则，拒绝所有指向 `80` 端口的连接，如下操作：

```bash
$ sudo ufw delete 2
```

> **注意：如果你启用了 IPv6 规则，这同时也将删除相应的 IPv6 规则。**

### 指定实际规则删除

如果你不想通过 *规则序号* 来删除，你可以指定 **创建时的参数格式** 来删除，例如：当你使用 `sudo ufw allow http` 创建的规则时，你可以通过如下方式删除：

```bash
$ sudo ufw delete allow http
```

同样你可以指定端口号来替代服务名：

```bash
$ sudo ufw delete allow 80
```

> **注意：这种方式将会同时删除相应的 IPv4 和 IPv6规则。**

## 关闭 UFW

现在，由于某些我们不想开启防火墙了，我们可以关闭它：

```bash
$ sudo ufw disable
```

## 重置 UFW 的配置

将入你配置了好多规则，但是你现在需要重新配置，抛弃之前的配置规则，你可以这么做：

```bash
$ sudo ufw reset
```

> **这个命令将会删除你之前配置的所有规则，但是默认规则将会被保留。**

## 总结

服务器安全一直都是一个重要的话题，开启防火墙使我们保护服务器安全的重要手段之一，所以，无论什么情况下，我们都应该为服务器开启防火墙。当然，开放 `SSH` 也是必不可少的，与此同时，你可以允许一些连接到您的服务器，同时并限制一些不必要的连接，这样您的服务器才会更加的安全的提供服务。

想了解更多的 `UFW` 防火墙配置，你可以参考这篇文章：[UFW Essentials: Common Firewall Rules and Commands](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands) 
