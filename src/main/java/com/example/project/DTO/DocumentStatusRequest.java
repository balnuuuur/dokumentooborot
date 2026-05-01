package com.example.project.DTO;

import com.example.project.enums.DocumentStatus;
import lombok.Data;

@Data
public class DocumentStatusRequest {
    private DocumentStatus status;
    private String rejectionReason;
}
