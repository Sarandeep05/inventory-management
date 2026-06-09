package com.inventory.inventory.category;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepo;

    public Category addCategory(@NonNull Category category) {
        return categoryRepo.save(category);
    }

    public List<Category> getAll() {
        return categoryRepo.findAll();
    }

    public Category update(@NonNull Long id, Category updated) {
        Category c = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        c.setName(updated.getName());
        return categoryRepo.save(c);
    }

    public void delete(@NonNull Long id) {
        categoryRepo.deleteById(id);
    }
}