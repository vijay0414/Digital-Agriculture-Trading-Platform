package com.example.productservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateProductRequest {

    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private String unit;
    private Integer availableQuantity;
    private Integer minOrderQty;
    private String status;
}