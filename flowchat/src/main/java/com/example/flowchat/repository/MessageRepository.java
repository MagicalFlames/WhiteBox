package com.example.flowchat.repository;

import com.example.flowchat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    //获取两个用户之间的聊天记录

    @Query("SELECT m FROM Message m WHERE " +
           "(m.fromUserId = :userId1 AND m.toUserId = :userId2) OR " +
           "(m.fromUserId = :userId2 AND m.toUserId = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findChatHistory(@Param("userId1") String userId1, @Param("userId2") String userId2);
    
}