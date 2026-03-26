package com.example.orderservice.repository;

import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByRetailerId(Long retailerId);

    List<Order> findByFarmerId(Long farmerId);

    List<Order> findByFarmerIdAndStatus(Long farmerId, OrderStatus status);

}