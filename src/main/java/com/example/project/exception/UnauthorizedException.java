package com.example.project.exception;

public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException() {
        super("Рұқсат жоқ. Бұл әрекетті орындауға рұқсатыңыз жеткіліксіз.");
    }

    public UnauthorizedException(String action, String username) {
        super(String.format("%s әрекетін орындауға рұқсат жоқ. Пайдаланушы: %s", action, username));
    }
}
