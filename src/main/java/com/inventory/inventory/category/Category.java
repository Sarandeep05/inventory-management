package com.inventory.inventory.category;

import jakarta.persistence.*;
import com.inventory.inventory.entity.Product;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Set;

import jakarta.validation.constraints.NotBlank;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    // Bidirectional optional (kept simple)
    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private Set<Product> products;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Set<Product> getProducts() { return products; }
    public void setProducts(Set<Product> products) { this.products = products; }
}