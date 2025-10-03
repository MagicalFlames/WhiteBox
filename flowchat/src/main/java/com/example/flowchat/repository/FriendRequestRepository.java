package com.example.flowchat.repository;

import com.example.flowchat.entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    
    // 查找用户收到的好友申请
    List<FriendRequest> findByToUserIdAndStatusOrderByCreatedAtDesc(String toUserId, FriendRequest.RequestStatus status);
    
    // 查找用户发送的好友申请
    List<FriendRequest> findByFromUserIdAndStatusOrderByCreatedAtDesc(String fromUserId, FriendRequest.RequestStatus status);
    
    // 查找两个用户之间的好友申请
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "((fr.fromUserId = :userId1 AND fr.toUserId = :userId2) OR " +
           "(fr.fromUserId = :userId2 AND fr.toUserId = :userId1)) " +
           "AND fr.status = :status " +
           "ORDER BY fr.createdAt DESC")
    List<FriendRequest> findBetweenUsersWithStatus(@Param("userId1") String userId1, 
                                                   @Param("userId2") String userId2,
                                                   @Param("status") FriendRequest.RequestStatus status);
    
    // 检查是否已经存在待处理的好友申请
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "((fr.fromUserId = :fromUserId AND fr.toUserId = :toUserId) OR " +
           "(fr.fromUserId = :toUserId AND fr.toUserId = :fromUserId)) " +
           "AND fr.status = 'PENDING'")
    Optional<FriendRequest> findPendingRequestBetweenUsers(@Param("fromUserId") String fromUserId, 
                                                          @Param("toUserId") String toUserId);
    
    // 获取用户的所有好友申请（收到的和发送的）
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "(fr.fromUserId = :userId OR fr.toUserId = :userId) " +
           "ORDER BY fr.createdAt DESC")
    List<FriendRequest> findAllByUserId(@Param("userId") String userId);
}