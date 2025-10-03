//发送消息太长，记住登陆状态，信息红点（当未选择用户时红点没显示），关闭对话框

package com.example.flowchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FlowchatApplication {

    public static void main(String[] args) {
        SpringApplication.run(FlowchatApplication.class, args);
    }
}
