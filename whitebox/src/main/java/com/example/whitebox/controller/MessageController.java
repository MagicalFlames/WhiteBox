package com.example.whitebox.controller;

import com.example.whitebox.entity.Message;
import com.example.whitebox.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") 
public class MessageController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private MessageRepository messageRepository;
    
    
    @MessageMapping("/chat/sendMessage")
    public void sendMessage(ChatMessage chatMessage) {
            // 保存消息到数据库
            Message message = new Message();
            message.setFromUserId(chatMessage.getFromUserId());
            message.setToUserId(chatMessage.getToUserId());
            message.setContent(chatMessage.getContent());
            
            Message savedMessage = messageRepository.save(message);
            
            // 创建响应消息
            ChatMessage responseMessage = new ChatMessage();
            responseMessage.setId(savedMessage.getId());
            responseMessage.setFromUserId(savedMessage.getFromUserId());
            responseMessage.setToUserId(savedMessage.getToUserId());
            responseMessage.setContent(savedMessage.getContent());
            responseMessage.setTimestamp(savedMessage.getCreatedAt());

            messagingTemplate.convertAndSend("/queue/messages/" + chatMessage.getToUserId(), responseMessage);
            messagingTemplate.convertAndSend("/queue/messages/" + chatMessage.getFromUserId(), responseMessage);
    }
    
    
    @GetMapping("/chat/history")
    public ResponseEntity<Map<String, Object>> getChatHistory(
            @RequestParam String userId1,
            @RequestParam String userId2) {
        
        Map<String, Object> response = new HashMap<>();
        
        List<Message> messages = messageRepository.findChatHistory(userId1, userId2);
        response.put("success", true);
        response.put("messages", messages);
        return ResponseEntity.ok(response);
    }
    
    
    // 聊天消息类
    public static class ChatMessage {
        private Long id;
        private String fromUserId;
        private String toUserId;
        private String content;
        private java.time.LocalDateTime timestamp;
        
        // Getter 和 Setter
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getFromUserId() { return fromUserId; }
        public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }
        
    
        public String getToUserId() { return toUserId; }
        public void setToUserId(String toUserId) { this.toUserId = toUserId; }
        
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public java.time.LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(java.time.LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
    
}