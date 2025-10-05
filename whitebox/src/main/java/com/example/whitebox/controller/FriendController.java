package com.example.whitebox.controller;

import com.example.whitebox.entity.FriendRequest;
import com.example.whitebox.entity.Friendship;
import com.example.whitebox.entity.User;
import com.example.whitebox.repository.FriendRequestRepository;
import com.example.whitebox.repository.FriendshipRepository;
import com.example.whitebox.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "*")
public class FriendController {
    
    @Autowired
    private FriendRequestRepository friendRequestRepository;
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // 发送好友申请
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> sendFriendRequest(@RequestBody FriendRequestDTO requestDTO) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<FriendRequest> existingRequest = friendRequestRepository.findPendingRequestBetweenUsers(requestDTO.getFromUserId(), requestDTO.getToUserId());
        if (existingRequest.isPresent()) {
            response.put("success", false);
            response.put("message", "请勿重复发送申请");
            return ResponseEntity.ok(response);
        }
            
        // 创建新的好友申请
        FriendRequest friendRequest = new FriendRequest(
                requestDTO.getFromUserId(),
                requestDTO.getToUserId(),
                requestDTO.getMessage()
        );
            
        friendRequestRepository.save(friendRequest);
        response.put("success", true);
        response.put("message", "好友申请已发送");
        return ResponseEntity.ok(response);
    }
    
    // 获取收到的好友申请
    @GetMapping("/requests/received/{userId}")
    public ResponseEntity<Map<String, Object>> getReceivedRequests(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        List<FriendRequest> requests = friendRequestRepository.findByToUserIdAndStatusOrderByCreatedAtDesc(userId, FriendRequest.RequestStatus.PENDING);
        List<Map<String, Object>> requestsWithUserInfo = new ArrayList<>();
        for (FriendRequest request : requests) {
            Map<String, Object> requestInfo = new HashMap<>();
            requestInfo.put("id", request.getId());
            requestInfo.put("fromUserId", request.getFromUserId());
            requestInfo.put("message", request.getMessage());
            requestInfo.put("createdAt", request.getCreatedAt());
            // 获取发送方用户信息
            Long fromUserIdLong = Long.parseLong(request.getFromUserId());
            Optional<User> fromUser = userRepository.findById(fromUserIdLong);
            requestInfo.put("fromUsername", fromUser.get().getUsername());
            requestsWithUserInfo.add(requestInfo);
        }
        response.put("success", true);
        response.put("requests", requestsWithUserInfo);
        return ResponseEntity.ok(response);
    }
    
    // 获取发送的好友申请
    @GetMapping("/requests/sent/{userId}")
    public ResponseEntity<Map<String, Object>> getSentRequests(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        List<FriendRequest> requests = friendRequestRepository.findByFromUserIdAndStatusOrderByCreatedAtDesc(userId, FriendRequest.RequestStatus.PENDING);
        List<Map<String, Object>> requestsWithUserInfo = new ArrayList<>();
        for (FriendRequest request : requests) {
            Map<String, Object> requestInfo = new HashMap<>();
            requestInfo.put("id", request.getId());
            requestInfo.put("toUserId", request.getToUserId());
            requestInfo.put("message", request.getMessage());
            requestInfo.put("createdAt", request.getCreatedAt());
             // 获取接收方用户信息
            Long toUserIdLong = Long.parseLong(request.getToUserId());
            Optional<User> toUser = userRepository.findById(toUserIdLong);
            requestInfo.put("toUsername", toUser.get().getUsername());
            requestsWithUserInfo.add(requestInfo);
        }
            
        response.put("success", true);
        response.put("requests", requestsWithUserInfo);
        return ResponseEntity.ok(response);
    }
    
    // 处理好友申请（接受或拒绝）
    @PostMapping("/request/{requestId}/{action}")
    public ResponseEntity<Map<String, Object>> handleFriendRequest(
            @PathVariable Long requestId,
            @PathVariable String action) {
        
        Map<String, Object> response = new HashMap<>();
        Optional<FriendRequest> requestOpt = friendRequestRepository.findById(requestId);
        FriendRequest request = requestOpt.get();
        if ("accept".equals(action)) {
            // 接受好友申请
            request.setStatus(FriendRequest.RequestStatus.ACCEPTED);
            friendRequestRepository.save(request);
            // 创建好友关系
            Friendship friendship = new Friendship(request.getFromUserId(), request.getToUserId());
            friendshipRepository.save(friendship);

            response.put("success", true);
            response.put("message", "已接受好友申请");   
            } 
            else if ("reject".equals(action)) {
                // 拒绝好友申请
                request.setStatus(FriendRequest.RequestStatus.REJECTED);
                friendRequestRepository.save(request);
                
                response.put("success", true);
                response.put("message", "已拒绝好友申请");
                
            } 
            else {
                response.put("success", false);
                response.put("message", "无效的操作");
            }
            
            return ResponseEntity.ok(response);
    }
    
    // 获取好友列表
    @GetMapping("/list/{userId}")
    public ResponseEntity<Map<String, Object>> getFriendsList(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        List<Friendship> friendships = friendshipRepository.findByUserId(userId);
        List<Map<String, Object>> friends = new ArrayList<>();
        for (Friendship friendship : friendships) {
            String friendUserId = friendship.getOtherUserId(userId);
            // 获取好友用户信息
            Long friendUserIdLong = Long.parseLong(friendUserId);
            Optional<User> friendUser = userRepository.findById(friendUserIdLong);
            if (friendUser.isPresent()) {
                Map<String, Object> friendInfo = new HashMap<>();
                friendInfo.put("userId", friendUserId);
                friendInfo.put("username", friendUser.get().getUsername());
                friendInfo.put("friendSince", friendship.getCreatedAt());
                friends.add(friendInfo);
            }
        }
            
        // 按用户名字典序排序
        friends.sort((a, b) -> ((String) a.get("username")).compareTo((String) b.get("username")));
            
        response.put("success", true);
        response.put("friends", friends);
        return ResponseEntity.ok(response);
    }

    // 删除好友
    @DeleteMapping("/{userId1}/{userId2}")
    public ResponseEntity<Map<String, Object>> deleteFriend(@PathVariable String userId1, @PathVariable String userId2) {
        Map<String, Object> response = new HashMap<>();
        friendshipRepository.deleteByUsers(userId1, userId2);

        response.put("success", true);
        response.put("message", "已删除好友");
        return ResponseEntity.ok(response);
    }
    
    
    // 好友申请DTO
    public static class FriendRequestDTO {
        private String fromUserId;
        private String toUserId;
        private String message;
        
        // Getter和Setter
        public String getFromUserId() { return fromUserId; }
        public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }
        
        public String getToUserId() { return toUserId; }
        public void setToUserId(String toUserId) { this.toUserId = toUserId; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}