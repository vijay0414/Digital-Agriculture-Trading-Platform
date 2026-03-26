package com.example.productservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Long farmerId;

    @Column(nullable = false)
    private String name;

    private String category;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private String unit;

    @Column(nullable = false)
    private Integer availableQuantity;

    private Integer minOrderQty;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}