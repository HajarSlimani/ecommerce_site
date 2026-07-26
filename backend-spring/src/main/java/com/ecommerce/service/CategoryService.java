package com.ecommerce.service;

import com.ecommerce.entity.Category;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<Map<String, Object>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> Map.<String, Object>of(
                        "id", category.getId(),
                        "name", category.getName(),
                        "productCount", productRepository.countByCategoryId(category.getId())
                ))
                .toList();
    }
}
