package com.example.productservice.repository;

import com.example.productservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByFarmerId(Long farmerId);
    List<Product> findByStatus(String status);
    List<Product> findByStatusAndCategory(String status, String category);
    List<Product> findByStatusAndNameContainingIgnoreCase(String status, String name);
}