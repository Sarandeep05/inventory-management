package com.inventory.inventory.service;

import com.inventory.inventory.entity.Order;
import com.inventory.inventory.entity.Product;
import com.inventory.inventory.repository.OrderRepository;
import com.inventory.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    OrderRepository orderRepo;

    @Autowired
    ProductRepository productRepo;

    // ✅ PLACE ORDER
    @Transactional
    public Order placeOrder(Long productId, int quantity, String userEmail) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        product.setStock(product.getStock() - quantity);
        productRepo.save(product);

        Order order = new Order();
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setUserEmail(userEmail);
        order.setStatus("CONFIRMED");
        order.setCreatedAt(LocalDateTime.now());

        return orderRepo.save(order);
    }

    // ✅ GET USER ORDERS
    public List<Order> getOrdersByUser(String email) {
        return orderRepo.findByUserEmail(email);
    }

    // ✅ CANCEL ORDER
    @Transactional
    public void cancelOrder(Long orderId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Already cancelled");
        }

        Product product = order.getProduct();
        product.setStock(product.getStock() + order.getQuantity());
        productRepo.save(product);

        order.setStatus("CANCELLED");
        orderRepo.save(order);
    }
}