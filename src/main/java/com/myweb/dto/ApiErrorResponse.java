package com.myweb.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Standardized API error response DTO.
 * All error responses from the backend follow this format.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path,
        Instant timestamp) {
    public ApiErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, Instant.now());
    }
}
