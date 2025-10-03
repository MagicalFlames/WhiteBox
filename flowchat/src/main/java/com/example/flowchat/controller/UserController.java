package com.example.flowchat.controller;

import com.example.flowchat.entity.User;
import com.example.flowchat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // 允许跨域请求
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (!"2335030124".equals(request.getInviteCode())) {
                response.put("success", false);
                response.put("message", "邀请码错误");
                return ResponseEntity.badRequest().body(response);
            }
            // 创建新用户
            User user = new User();
            
            user.setUsername(request.getUsername().trim());
            // 加密密码
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            // 保存用户到数据库
            User savedUser = userRepository.save(user);
            
            // 返回成功响应
            response.put("success", true);
            response.put("message", "注册成功");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("createdAt", savedUser.getCreatedAt());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // 处理异常
            response.put("success", false);
            response.put("message", "注册失败：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 将字符串ID转换为Long类型
            Long userId;
            try {
                userId = Long.parseLong(request.getUserId());
            } catch (NumberFormatException e) {
                response.put("success", false);
                response.put("message", "用户ID格式错误");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 根据用户ID查找用户
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.badRequest().body(response);
            }
            
            User user = userOpt.get();
            
            // 验证密码
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                response.put("success", false);
                response.put("message", "账号或密码错误");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 登录成功
            response.put("success", true);
            response.put("message", "登录成功");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "登录失败：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // 用户搜索API
    @GetMapping("/users/search")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(@RequestParam String username) {
        try {
            List<User> users = userRepository.findByUsernameContaining(username);
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (User user : users) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", user.getId().intValue());
                userInfo.put("username", user.getUsername());
                result.add(userInfo);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    // 内部类：注册请求
    public static class RegisterRequest {
        private String inviteCode;
        private String username;
        private String password;
        
        // Getter 和 Setter
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getInviteCode() { return inviteCode; }
        public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
    }
    
    // 内部类：登录请求
    public static class LoginRequest {
        private String userid;
        private String password;
        
        // Getter 和 Setter
        public String getUserId() { return userid; }
        public void setUserId(String userid) { this.userid = userid; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}