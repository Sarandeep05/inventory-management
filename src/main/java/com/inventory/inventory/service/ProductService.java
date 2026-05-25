package com.inventory.inventory.service;

import com.inventory.inventory.entity.Product;
import com.inventory.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    public Product addProduct(Product p) {
        p.setStatus("ACTIVE");
        return repo.save(p);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    // UPDATE
    public Product updateProduct(Long id, Product p) {
        Product existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existing.setName(p.getName());
        existing.setDescription(p.getDescription());
        existing.setPrice(p.getPrice());
        existing.setStock(p.getStock());
        existing.setStatus(p.getStatus());
        existing.setCategories(p.getCategories());

        return repo.save(existing);
    }

    // DELETE
    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    // SEARCH
    public List<Product> search(String name) {
        return repo.findByNameContaining(name);
    }

    // LOW STOCK
    public List<Product> lowStock() {
        return repo.findByStockLessThan(5);
    }

    // FILTER BY CATEGORY
    public List<Product> byCategory(Long id) {
        return repo.findByCategories_Id(id);
    }

    // PAGINATION + SORT
    public Page<Product> paginate(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return repo.findAll(pageable);
    }
}