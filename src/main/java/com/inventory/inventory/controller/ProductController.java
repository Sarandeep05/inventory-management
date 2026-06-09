package com.inventory.inventory.controller;

import com.inventory.inventory.entity.Product;
import com.inventory.inventory.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/products")
@SuppressWarnings("null")
public class ProductController {

    @Autowired
    ProductService service;

    // ADMIN
    @PostMapping("/add")
    public Product addProduct(@Valid @RequestBody Product product) {
        return service.addProduct(product);
    }

    // ADMIN
    @PutMapping("/update/{id}")
    public Product update(@PathVariable Long id, @Valid @RequestBody Product p) {
        return service.updateProduct(id, p);
    }

    // ADMIN
    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteProduct(id);
        return "Deleted";
    }

    // ALL
    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // SEARCH
    @GetMapping("/search")
    public List<Product> search(@RequestParam String name) {
        return service.search(name);
    }

    // LOW STOCK
    @GetMapping("/low-stock")
    public List<Product> lowStock() {
        return service.lowStock();
    }

    // FILTER CATEGORY
    @GetMapping("/category/{id}")
    public List<Product> byCategory(@PathVariable Long id) {
        return service.byCategory(id);
    }

    // PAGINATION
    @GetMapping("/page")
    public Page<Product> paginate(@RequestParam int page,
                                  @RequestParam int size,
                                  @RequestParam(defaultValue = "price") String sortBy) {
        return service.paginate(page, size, sortBy);
    }
}