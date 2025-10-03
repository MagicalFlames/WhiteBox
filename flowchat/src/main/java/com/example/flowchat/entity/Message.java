package com.example.flowchat.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_user_id")
    private String fromUserId;
    
    @Column(name = "to_user_id")
    private String toUserId;
    
    @Column(name = "content")
    private String content;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    
    // 构造函数
    public Message() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Message(String fromUserId, String toUserId, String content) {
        this();
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.content = content;
    }
    
    // Getter 和 Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFromUserId() { return fromUserId; }
    public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }
    
    public String getToUserId() { return toUserId; }
    public void setToUserId(String toUserId) { this.toUserId = toUserId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}