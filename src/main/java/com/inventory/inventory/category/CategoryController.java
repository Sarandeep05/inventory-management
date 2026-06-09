package com.inventory.inventory.category;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/categories")
@SuppressWarnings("null")
public class CategoryController {

    @Autowired
    private CategoryService service;

    // ADMIN
    @PostMapping
    public Category add(@Valid @RequestBody Category c) {
        return service.addCategory(c);
    }

    // ADMIN
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @Valid @RequestBody Category c) {
        return service.update(id, c);
    }

    // ADMIN
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Category deleted";
    }

    // ALL
    @GetMapping
    public List<Category> getAll() {
        return service.getAll();
    }
}