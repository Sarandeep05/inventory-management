package com.inventory.inventory.repository;

import com.inventory.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContaining(String name);

    List<Product> findByStockLessThan(int stock);

    List<Product> findByCategories_Id(Long categoryId);
}