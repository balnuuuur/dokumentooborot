package com.example.project.service;

import com.example.project.DTO.ChangePasswordRequest;
import com.example.project.DTO.LoginRequest;
import com.example.project.DTO.RegisterRequest;
import com.example.project.entity.Document;
import com.example.project.entity.User;
import com.example.project.enums.Role;
import com.example.project.repository.DocumentRepository;
import com.example.project.repository.UserRepository;
import com.example.project.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Бұл пайдаланушы аты бос емес");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Бұл электронды пошта бос емес");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        userRepository.save(user);
        return "Қош келдіңіз, " + user.getUsername();
    }

    public String login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Пайдаланушы табылмады"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return token;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пайдаланушы табылмады: " + username));
    }

    public User findByRoleAdmin() {
        return userRepository.findByRole(Role.ADMIN);
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пайдаланушы табылмады"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Ағымдағы құпия сөз қате");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пайдаланушы табылмады"));

        List<Document> userDocuments = documentRepository.findByOwnerId(user.getId());
        for (Document doc : userDocuments) {
            try {
                fileStorageService.deleteFile(doc.getFilePath());
            } catch (IOException e) {
            }
        }
        userRepository.delete(user);
    }
}