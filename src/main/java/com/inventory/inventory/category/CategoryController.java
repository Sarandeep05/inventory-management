package com.inventory.inventory.category;

import com.inventory.inventory.category.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService service;

    // ADMIN
    @PostMapping
    public Category add(@RequestBody Category c) {
        return service.addCategory(c);
    }

    // ADMIN
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category c) {
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