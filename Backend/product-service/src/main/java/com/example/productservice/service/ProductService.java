package com.example.productservice.service;

import com.example.productservice.dto.CreateProductRequest;
import com.example.productservice.dto.UpdateProductRequest;
import com.example.productservice.entity.Product;
import com.example.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product createProduct(CreateProductRequest request) {

        Product product = Product.builder()
                .farmerId(request.getFarmerId())
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .price(request.getPrice())
                .unit(request.getUnit())
                .availableQuantity(request.getAvailableQuantity())
                .minOrderQty(request.getMinOrderQty())
                .status(request.getStatus())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return productRepository.save(product);
    }
    public Product updateProduct(UUID productId, UpdateProductRequest request) {

    Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

    product.setName(request.getName());
    product.setCategory(request.getCategory());
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    product.setUnit(request.getUnit());
    product.setAvailableQuantity(request.getAvailableQuantity());
    product.setMinOrderQty(request.getMinOrderQty());
    product.setStatus(request.getStatus());
    product.setUpdatedAt(java.time.LocalDateTime.now());

    return productRepository.save(product);
}
    public void deleteProduct(UUID productId) {

    Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

    productRepository.delete(product);
}
    
    public List<Product> getAllActiveProducts() {
    return productRepository.findByStatus("ACTIVE");
}

public List<Product> getActiveProductsByCategory(String category) {
    return productRepository.findByStatusAndCategory("ACTIVE", category);
}

public List<Product> searchActiveProductsByName(String name) {
    return productRepository.findByStatusAndNameContainingIgnoreCase("ACTIVE", name);
}
    public List<Product> getProductsByFarmer(Long farmerId) {
        return productRepository.findByFarmerId(farmerId);
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }
}