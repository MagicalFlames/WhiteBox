package com.example.flowchat.repository;

import com.example.flowchat.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    // 查找用户的所有好友关系
    @Query("SELECT f FROM Friendship f WHERE f.user1Id = :userId OR f.user2Id = :userId ORDER BY f.createdAt DESC")
    List<Friendship> findByUserId(@Param("userId") String userId);
    
    // 检查两个用户是否是好友
    @Query("SELECT f FROM Friendship f WHERE " +
           "((f.user1Id = :userId1 AND f.user2Id = :userId2) OR " +
           "(f.user1Id = :userId2 AND f.user2Id = :userId1))")
    Optional<Friendship> findByUsers(@Param("userId1") String userId1, @Param("userId2") String userId2);
    
    // 检查两个用户是否是好友（返回boolean）
    @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
           "((f.user1Id = :userId1 AND f.user2Id = :userId2) OR " +
           "(f.user1Id = :userId2 AND f.user2Id = :userId1))")
    boolean areUsersFriends(@Param("userId1") String userId1, @Param("userId2") String userId2);
    
    // 删除好友关系
    @Query("DELETE FROM Friendship f WHERE " +
           "((f.user1Id = :userId1 AND f.user2Id = :userId2) OR " +
           "(f.user1Id = :userId2 AND f.user2Id = :userId1))")
    void deleteByUsers(@Param("userId1") String userId1, @Param("userId2") String userId2);
}