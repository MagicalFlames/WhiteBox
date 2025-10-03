package com.example.flowchat.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "friendships")
public class Friendship {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user1_id", nullable = false, length = 50)
    private String user1Id;
    
    @Column(name = "user2_id", nullable = false, length = 50)
    private String user2Id;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // 构造函数
    public Friendship() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Friendship(String user1Id, String user2Id) {
        this();
        // 确保较小的ID在前面，便于查询
        if (user1Id.compareTo(user2Id) <= 0) {
            this.user1Id = user1Id;
            this.user2Id = user2Id;
        } else {
            this.user1Id = user2Id;
            this.user2Id = user1Id;
        }
    }
    
    // Getter 和 Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUser1Id() { return user1Id; }
    public void setUser1Id(String user1Id) { this.user1Id = user1Id; }
    
    public String getUser2Id() { return user2Id; }
    public void setUser2Id(String user2Id) { this.user2Id = user2Id; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // 辅助方法：获取对方用户ID
    public String getOtherUserId(String userId) {
        if (user1Id.equals(userId)) {
            return user2Id;
        } else if (user2Id.equals(userId)) {
            return user1Id;
        }
        return null;
    }
    
}