package com.example.productservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateProductRequest {

    private Long farmerId;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private String unit;
    private Integer availableQuantity;
    private Integer minOrderQty;
    private String status;
}