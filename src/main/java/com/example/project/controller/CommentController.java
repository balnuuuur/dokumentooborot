package com.example.project.controller;

import com.example.project.DTO.ApiResponse;
import com.example.project.DTO.CommentRequest;
import com.example.project.entity.Comment;
import com.example.project.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/document/{documentId}")
    public ApiResponse<Comment> addComment(
            @PathVariable Long documentId,
            @RequestBody CommentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Comment comment = commentService.addComment(documentId, username, request.getContent());
            return ApiResponse.success("Пікір қосылды", comment);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/document/{documentId}")
    public ApiResponse<List<Comment>> getCommentsByDocument(@PathVariable Long documentId) {
        try {
            List<Comment> comments = commentService.getCommentsByDocument(documentId);
            return ApiResponse.success("Құжатқа қалдырылған пікірлер", comments);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{commentId}")
    public ApiResponse<Comment> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Comment comment = commentService.updateComment(commentId, username, request.getContent());
            return ApiResponse.success("Пікір жаңартылды", comment);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            commentService.deleteComment(commentId, username);
            return ApiResponse.success("Пікір жойылды", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
