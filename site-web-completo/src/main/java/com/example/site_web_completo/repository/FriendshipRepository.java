package com.example.site_web_completo.repository;

import com.example.site_web_completo.model.Friendship;
import com.example.site_web_completo.model.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("select f from Friendship f where " +
            "(f.requester.id = :a and f.addressee.id = :b) or " +
            "(f.requester.id = :b and f.addressee.id = :a)")
    Optional<Friendship> findBetween(@Param("a") Long a, @Param("b") Long b);

    @Query("select f from Friendship f where f.status = :status and " +
            "(f.requester.id = :userId or f.addressee.id = :userId)")
    List<Friendship> findByUserAndStatus(@Param("userId") Long userId,
                                         @Param("status") FriendshipStatus status);

    List<Friendship> findByAddresseeIdAndStatus(Long addresseeId, FriendshipStatus status);
}