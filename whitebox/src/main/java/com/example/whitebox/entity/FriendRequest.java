package com.example.whitebox.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "friend_requests")
public class FriendRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_user_id")
    private String fromUserId;
    
    @Column(name = "to_user_id")
    private String toUserId;
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private RequestStatus status;
    
    @Column(name = "message")
    private String message;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 枚举状态
    public enum RequestStatus {
        PENDING,    // 待处理
        ACCEPTED,   // 已接受
        REJECTED    // 已拒绝
    }
    
    // 构造函数
    public FriendRequest() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = RequestStatus.PENDING;
    }
    
    public FriendRequest(String fromUserId, String toUserId, String message) {
        this();
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.message = message;
    }
    
    // Getter 和 Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFromUserId() { return fromUserId; }
    public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }
    
    public String getToUserId() { return toUserId; }
    public void setToUserId(String toUserId) { this.toUserId = toUserId; }
    
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { 
        this.status = status; 
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}