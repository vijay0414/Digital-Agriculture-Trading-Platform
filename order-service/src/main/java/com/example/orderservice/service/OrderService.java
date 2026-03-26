package com.example.orderservice.service;

import com.example.orderservice.dto.PlaceOrderRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(Long retailerId, PlaceOrderRequest request);

    List<Order> getOrdersByRetailer(Long retailerId);

    List<Order> getOrdersByFarmer(Long farmerId);

    List<Order> getOrdersByFarmerAndStatus(Long farmerId, OrderStatus status);

    Order confirmOrder(Long orderId);

    Order cancelOrder(Long orderId);
}