### server
多进程架构  
一个机器可以有多个进程，一个进程可以有多个scene，scene相当于一个actor，可以单独处理事务, 可以拆分也可以合并, 开发时一个进程，部署时多个进程，只需要简单的配置即可  
比如Realm Scene就是专门分配网关的，Gate Scene就是网关，比如聊天 可以专门加一个Chat Scene