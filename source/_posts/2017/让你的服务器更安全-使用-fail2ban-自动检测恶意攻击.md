---
title: 让你的服务器更安全 - 使用 Fail2ban 自动检测恶意攻击
date: 2017-10-31 10:57:24
categories: Linux
tags:
    - Linux
    - Fail2ban
    - Security
---

对于 `SSH` 服务的常见的攻击就是暴力破解攻击——远程攻击者通过不同的密码来无限次地进行登录尝试。当然 `SSH` 可以设置使用非密码验证验证方式来对抗这种攻击，例如 `公钥验证` 或者 `双重验证`。将不同的验证方法的优劣处先放在一边，如果我们必须使用密码验证方式怎么办？你是如何保护你的 `SSH` 服务器免遭暴力破解攻击的呢？

`fail2ban` 是 `Linux` 上的一个著名的入侵保护的开源框架，它会监控多个系统的日志文件（例如：`/var/log/auth.log` 或者 `/var/log/secure`）并根据检测到的任何可疑的行为自动触发不同的防御动作。事实上，`fail2ban`在防御对 `SSH` 服务器的暴力密码破解上非常有用。

在这篇指导教程中，我会演示如何安装并配置 `fail2ban` 来保护 `SSH` 服务器以避免来自远程 `IP` 地址的暴力攻击。

<!-- more -->

**注：本文仅介绍在 Ubuntu 中的使用方式，其他系统请参考官方手册。**

## 使用前提

你的服务器需要安装 `Fail2ban`，安装如下。

```bash
$ sudo apt-get install fail2ban
```

你也许会和其他服务配置使用，如：`iptables`、`sendmail`，详情请参考：

- [让你的服务器更安全 - 使用 Iptables 防火墙](#)
- [邮件服务器 - sendmail/postfix](#)

## 如何使用

### 基础定义

在使用之前，我们需要了解 `fail2ban` 中每个术语的意义与作用：

- `filter`：过滤器，定义了一系列正在表达式，用于匹配指定日志文件中的每行内容。
- `action`：执行动作，当 `fail2ban` 检测到可疑行为时做出的动作。
- `jail`：任务，定义 `fail2ban` 的自动检测任务，可以自由组合 `filter` 和 `action`。 
- `fail2ban-server`：`fail2ban` 服务器。
- `fail2ban-client`：`fail2ban` 客户端。

### fail2ban 服务器

`fail2ban` 是一个多线程的服务器，用于执行 `fail2ban-client` 发送过来的命令。操作如下：

```bash
$ sudo service fail2ban start|stop|restart
```

### fail2ban 客户端

`fail2ban` 客户端，他通过 `Unix domain socket` 的方式连接服务器，通过发送命令去配置和操作 `fail2ban` 服务器，常用选项如下：

```bash
-c <DIR>                configuration directory
-s <FILE>               socket path
-d                      dump configuration. For debugging
-i                      interactive mode
-v                      increase verbosity
-q                      decrease verbosity
-x                      force execution of the server
-h, --help              display this help message
-V, --version           print the version
```

配置文件里定义的所有配置都可以手动修改的，只需要通过 `set` 命令修改即可，如下：

```bash
$ sudo fail2ban-client set loglevel 1
$ sudo fail2ban-client set logtarget STDERR
```

启动服务：

```bash
$ sudo fail2ban-client start
```

更新配置：

```bash
$ sudo faile2ban-client reload
```

### 定义配置

首先，我们先来看一下 `fail2ban` 的配置目录结构：

```bash
/etc/fail2ban/
├── action.d
│   ├── dummy.conf
│   ├── hostsdeny.conf
│   ├── iptables.conf
│   ├── mail-whois.conf
│   ├── mail.conf
│   └── shorewall.conf
├── fail2ban.conf
├── fail2ban.local
├── filter.d
│   ├── apache-auth.conf
│   ├── apache-noscript.conf
│   ├── couriersmtp.conf
│   ├── postfix.conf
│   ├── proftpd.conf
│   ├── qmail.conf
│   ├── sasl.conf
│   ├── sshd.conf
│   └── vsftpd.conf
├── jail.conf
├── jail.local
├── jail.d
│   ├── your_jail.conf
```

- `action.d`：定义了一系列动作，如：发送邮件、使用 iptables 等，自定义的动作也放在该目录下。
- `fail2ban.conf`：定义了 `fail2ban` 服务配置。
- `filter.d`：定义了一系列过滤器，安装时会自带一些，自定义过滤器也房放在该目录下。
- `jail.conf`：定义自动检测任务，包含一些默认参数，定义了一些常用服务的检测规则。
- `jail.d`：自定义检测任务规则，存放在该目录下。

### 任务配置

## 参考链接

[Fail2ban Official Manual](https://www.fail2ban.org/wiki/index.php/MANUAL_0_8#Introduction)
