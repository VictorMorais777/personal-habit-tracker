package com.example.site_web_completo.service;

import com.example.site_web_completo.model.Friendship;
import com.example.site_web_completo.model.FriendshipStatus;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.repository.FriendshipRepository;
import com.example.site_web_completo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FriendshipService {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Friendship getFriendship(Long id) {
        return friendshipRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friendship not found"));
    }

    public Friendship sendRequest(String requesterEmail, Long addresseeId) {
        User requester = getUserByEmail(requesterEmail);

        if (requester.getId().equals(addresseeId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot add yourself");
        }

        User addressee = userRepository.findById(addresseeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (friendshipRepository.findBetween(requester.getId(), addresseeId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request or friendship already exists");
        }

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setAddressee(addressee);
        return friendshipRepository.save(friendship);
    }

    public Friendship accept(String email, Long friendshipId) {
        Friendship friendship = getFriendship(friendshipId);

        if (!friendship.getAddressee().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the recipient can accept");
        }
        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request is not pending");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    public void remove(String email, Long friendshipId) {
        Friendship friendship = getFriendship(friendshipId);

        boolean involved = friendship.getRequester().getEmail().equals(email)
                || friendship.getAddressee().getEmail().equals(email);
        if (!involved) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your friendship");
        }

        friendshipRepository.delete(friendship);
    }

    public List<Friendship> listFriends(String email) {
        User user = getUserByEmail(email);
        return friendshipRepository.findByUserAndStatus(user.getId(), FriendshipStatus.ACCEPTED);
    }

    public List<Friendship> listReceivedRequests(String email) {
        User user = getUserByEmail(email);
        return friendshipRepository.findByAddresseeIdAndStatus(user.getId(), FriendshipStatus.PENDING);
    }
}