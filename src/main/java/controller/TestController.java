package com.inventory.inventory.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "JWT is working 🔥";
    }
}