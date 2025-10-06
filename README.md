# WhiteBox

## 项目简介

WhiteBox是一个基于Spring Boot开发的实时聊天应用，支持用户注册、登录、好友管理和实时消息传递。项目采用前后端分离的架构，使用WebSocket技术实现实时通信。

## 技术栈

- 后端: Spring Boot 2.6.13 + Java 17
- 数据库: H2 (内嵌数据库)
- 前端: HTML + CSS + JavaScript
- 实时通信: WebSocket + STOMP
- 构建工具: Maven
- 安全框架: Spring Security

## 项目结构

```
whitebox/
├── pom.xml                                    # Maven配置文件
└──src/
    └── main/
        ├── java/com/example/whitebox/
        │   ├── WhiteBoxApplication.java       # 应用程序主入口
        │   ├── config/
        │   │   ├── SecurityConfig.java        # Spring Security安全配置
        │   │   └── WebSocketConfig.java       # WebSocket配置
        │   ├── controller/
        │   │   ├── FriendController.java      # 好友管理接口
        │   │   ├── MessageController.java     # 消息处理接口
        │   │   └── UserController.java        # 用户管理接口
        │   ├── entity/
        │   │   ├── FriendRequest.java         # 好友请求实体
        │   │   ├── Friendship.java            # 好友关系实体
        │   │   ├── Message.java               # 消息实体
        │   │   └── User.java                  # 用户实体
        │   └── repository/
        │       ├── FriendRequestRepository.java  # 好友请求数据访问
        │       ├── FriendshipRepository.java     # 好友关系数据访问
        │       ├── MessageRepository.java        # 消息数据访问
        │       └── UserRepository.java           # 用户数据访问
        └── resources/
            ├── application.properties         # 应用配置文件
            └── static/                        # 静态资源目录
                ├── index.html                 # 首页
                ├── login.html                 # 登录页面
                ├── register.html              # 注册页面
                ├── chat.html                  # 聊天页面
                ├── css/                       # 样式文件
                │   ├── index.css              # 首页样式
                │   ├── login.css              # 登录页面样式
                │   ├── register.css           # 注册页面样式
                │   └── chat.css               # 聊天页面样式
                └── js/                        # JavaScript文件
                    ├── common.js              # 公共工具函数
                    ├── index.js               # 首页脚本
                    ├── login.js               # 登录页面脚本
                    ├── register.js            # 注册页面脚本
                    └── chat.js                # 聊天页面脚本

```

## 核心功能模块

### 1. 用户管理 (UserController)
- 用户注册: POST /api/users/register
- 用户登录: POST /api/users/login
- 获取用户信息: GET /api/users/{userId}

### 2. 好友管理 (FriendController)
- 发送好友请求: POST /api/friends/request
- 处理好友请求: POST /api/friends/handle-request
- 获取好友列表: GET /api/friends
- 获取好友请求: GET /api/friends/requests

### 3. 消息管理 (MessageController)
- 发送私聊消息: WebSocket /app/chat
- 获取聊天记录: GET /api/messages/{friendId}

### 4. 实时通信 (WebSocketConfig)
- WebSocket连接端点: /ws
- 消息订阅地址: /topic/messages/{userId}
- 消息发送地址: /app/chat

## 数据库表结构

### users (用户表)
- id: 主键ID
- username: 用户名
- password: 密码 (加密存储)
- created_at: 创建时间

### friendships (好友关系表)
- id: 主键ID
- user1_id: 用户1的ID
- user2_id: 用户2的ID
- created_at: 建立好友关系时间

### friend_requests (好友请求表)
- id: 主键ID
- from_user_id: 发送请求的用户ID
- to_user_id: 接收请求的用户ID
- message: 请求消息
- status: 请求状态 (PENDING/ACCEPTED/REJECTED)
- created_at: 创建时间
- updated_at: 更新时间

### messages (消息表)
- id: 主键ID
- from_user_id: 发送者ID
- to_user_id: 接收者ID
- content: 消息内容
- created_at: 发送时间

## 运行说明

### 环境要求
- Java 17
- Maven 3.6+

### 启动步骤
1. 进入项目目录: cd whitebox
2. 启动应用: mvn spring-boot:run
3. 访问应用: http://localhost:8080

### 默认配置
- 服务端口: 8080
- 数据库: H2 (文件存储在 ./data/whitebox.mv.db)
- H2控制台: http://localhost:8080/h2-console

## 页面功能说明

### index.html - 首页
应用主页面。

### login.html - 登录页
用户登录界面，支持用户ID和密码登录，登录成功后自动跳转到聊天页面。

### register.html - 注册页
用户注册界面，需要填写用户名、密码和邀请码。

### chat.html - 聊天页
主要功能界面，包含:
- 好友列表显示
- 好友请求管理
- 实时聊天功能
- 消息历史记录

## 安全配置

项目使用Spring Security进行安全控制:
- 静态资源和API接口允许匿名访问
- 支持跨域请求
- 密码使用BCrypt加密存储


### 数据库管理
- 开发环境使用H2内嵌数据库
- 可通过H2控制台查看和管理数据
- 数据库文件保存在data目录下

## 注意事项

1. 首次运行会自动创建数据库表
2. 建议不要使用移动设备访问
3. 邀请码默认为学号
4. 账号是指用户名，不作为账户唯一标识
5. 已部署在云服务器，可访问https://shuanglin33984.xyz:8443/
