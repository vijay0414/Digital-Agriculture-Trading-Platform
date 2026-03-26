package com.example.orderservice.service;

import com.example.orderservice.dto.PlaceOrderRequest;
import com.example.orderservice.dto.OrderItemRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderItem;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public OrderResponse placeOrder(Long retailerId, PlaceOrderRequest request) {

        Order order = new Order();
        order.setRetailerId(retailerId);
        order.setFarmerId(request.getFarmerId());

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest item : request.getItems()) {

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());

            // Temporary price (later will come from Product Service)
            BigDecimal price = BigDecimal.valueOf(10);

            orderItem.setUnitPrice(price);

            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            orderItem.setLineTotal(lineTotal);

            total = total.add(lineTotal);

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        OrderResponse response = new OrderResponse();
        response.setOrderId(savedOrder.getId());
        response.setStatus(savedOrder.getStatus().name());
        response.setTotalAmount(savedOrder.getTotalAmount());

        return response;
    }

    @Override
    public List<Order> getOrdersByRetailer(Long retailerId) {
        return orderRepository.findByRetailerId(retailerId);
    }

    @Override
    public List<Order> getOrdersByFarmer(Long farmerId) {
        return orderRepository.findByFarmerId(farmerId);
    }

    @Override
    public List<Order> getOrdersByFarmerAndStatus(Long farmerId, OrderStatus status) {
        return orderRepository.findByFarmerIdAndStatus(farmerId, status);
    }

    @Override
    public Order confirmOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.CONFIRMED);

        return orderRepository.save(order);
    }

    @Override
    public Order cancelOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.CANCELLED);

        return orderRepository.save(order);
    }
}