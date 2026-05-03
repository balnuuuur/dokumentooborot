package com.example.project.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s табылмады. ID: %d", resourceName, id));
    }

    public ResourceNotFoundException(String resourceName, String username) {
        super(String.format("%s табылмады. Пайдаланушы: %s", resourceName, username));
    }
}
