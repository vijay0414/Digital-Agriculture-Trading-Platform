package com.example.orderservice.controller;

import com.example.orderservice.dto.PlaceOrderRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.service.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/retailers/me/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Place Order — RETAILER only (enforced by SecurityConfig)
    @PostMapping
    public OrderResponse placeOrder(
            Authentication authentication,
            @RequestBody PlaceOrderRequest request
    ) {
        Long retailerId = (Long) authentication.getDetails();
        return orderService.placeOrder(retailerId, request);
    }

    // Get Retailer's own Orders — RETAILER only
    @GetMapping("/retailer")
    public List<Order> getRetailerOrders(Authentication authentication) {
        Long retailerId = (Long) authentication.getDetails();
        return orderService.getOrdersByRetailer(retailerId);
    }

    // Get Farmer's Orders — FARMER only, with optional status filter
    @GetMapping("/farmer")
    public List<Order> getFarmerOrders(
            Authentication authentication,
            @RequestParam(required = false) OrderStatus status
    ) {
        Long farmerId = (Long) authentication.getDetails();
        if (status != null) {
            return orderService.getOrdersByFarmerAndStatus(farmerId, status);
        }
        return orderService.getOrdersByFarmer(farmerId);
    }

    // Confirm Order — FARMER only
    @PatchMapping("/{orderId}/confirm")
    public Order confirmOrder(@PathVariable Long orderId) {
        return orderService.confirmOrder(orderId);
    }

    // Cancel Order — FARMER or RETAILER
    @PatchMapping("/{orderId}/cancel")
    public Order cancelOrder(@PathVariable Long orderId) {
        return orderService.cancelOrder(orderId);
    }
}
