package com.inventory.inventory.controller;

import com.inventory.inventory.entity.Order;
import com.inventory.inventory.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/orders")
@SuppressWarnings("null")
public class OrderController {

    @Autowired
    OrderService service;

    // ✅ PLACE ORDER
    @PostMapping("/place")
    public Order placeOrder(@RequestParam Long productId,
                            @RequestParam int quantity,
                            Principal principal) {

        return service.placeOrder(productId, quantity, principal.getName());
    }

    // ✅ GET MY ORDERS
    @GetMapping("/my-orders")
    public List<Order> getMyOrders(Authentication auth) {
        String email = auth.getName();
        return service.getOrdersByUser(email);
    }

    // ✅ CANCEL ORDER
    @PutMapping("/cancel/{orderId}")
    public String cancelOrder(@PathVariable Long orderId) {
        service.cancelOrder(orderId);
        return "Order cancelled successfully";
    }
}