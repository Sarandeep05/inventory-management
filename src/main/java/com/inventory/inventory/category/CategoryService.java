package com.inventory.inventory.category;

import com.inventory.inventory.category.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepo;

    public Category addCategory(Category category) {
        return categoryRepo.save(category);
    }

    public List<Category> getAll() {
        return categoryRepo.findAll();
    }

    public Category update(Long id, Category updated) {
        Category c = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        c.setName(updated.getName());
        return categoryRepo.save(c);
    }

    public void delete(Long id) {
        categoryRepo.deleteById(id);
    }
}