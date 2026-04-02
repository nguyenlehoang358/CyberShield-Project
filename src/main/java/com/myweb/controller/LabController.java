package com.myweb.controller;

import com.myweb.service.GeminiLabMentorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/lab")
public class LabController {

    private final GeminiLabMentorService geminiLabMentorService;

    public LabController(GeminiLabMentorService geminiLabMentorService) {
        this.geminiLabMentorService = geminiLabMentorService;
    }

    @GetMapping("/{labType}/suggestions")
    public ResponseEntity<List<String>> getAutoSuggest(
            @PathVariable("labType") String labType,
            @RequestParam(value = "q", required = false) String userInput) {
        List<String> suggestions = geminiLabMentorService.generateAutoSuggestPayloads(labType, userInput);
        return ResponseEntity.ok(suggestions);
    }
}
