package com.ecommerce.service;

import com.ecommerce.dto.CreateProductRequest;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.PriceHistory;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.PriceHistoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAllWithUnits();
    }

    public Product getProduct(Long id) {
        return productRepository.findByIdWithUnits(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }

    @Transactional
    public Product createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.getCategoryId()));

        Product product = Product.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .build();

        Product saved = productRepository.save(product);

        priceHistoryRepository.save(PriceHistory.builder()
                .product(saved)
                .oldPrice(request.getBasePrice())
                .newPrice(request.getBasePrice())
                .reason("initial-price")
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Transactional
    public Product updateBasePrice(Long productId, BigDecimal newPrice, String reason) {
        Product product = getProduct(productId);
        BigDecimal oldPrice = product.getBasePrice();
        product.setBasePrice(newPrice);
        Product saved = productRepository.save(product);

        priceHistoryRepository.save(PriceHistory.builder()
                .product(saved)
                .oldPrice(oldPrice)
                .newPrice(newPrice)
                .reason(reason == null || reason.isBlank() ? "manual-update" : reason)
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }
}
