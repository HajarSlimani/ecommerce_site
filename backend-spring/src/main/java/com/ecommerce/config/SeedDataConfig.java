package com.ecommerce.config;

import com.ecommerce.entity.*;
import com.ecommerce.enums.CartStatus;
import com.ecommerce.enums.ConditionGrade;
import com.ecommerce.enums.Role;
import com.ecommerce.enums.UnitStatus;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SeedDataConfig {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductUnitRepository productUnitRepository;
    private final CartRepository cartRepository;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            User user = userRepository.save(User.builder()
                    .email("client@demo.com")
                    .password("demo123")
                    .role(Role.CUSTOMER)
                    .createdAt(LocalDateTime.now())
                    .build());

            Category laptop = categoryRepository.save(Category.builder()
                    .name("Laptops")
                    .build());

            Product product = productRepository.save(Product.builder()
                    .category(laptop)
                    .name("Lenovo ThinkPad X1")
                    .description("Ultrabook professionnel reconditionne")
                    .basePrice(new BigDecimal("999.00"))
                    .build());

            productUnitRepository.save(ProductUnit.builder()
                    .product(product)
                    .serialNumber("SN-X1-001")
                    .grade(ConditionGrade.A)
                    .currentPrice(new BigDecimal("999.00"))
                    .status(UnitStatus.AVAILABLE)
                    .acquisitionDate(LocalDateTime.now().minusDays(10))
                    .build());

            productUnitRepository.save(ProductUnit.builder()
                    .product(product)
                    .serialNumber("SN-X1-002")
                    .grade(ConditionGrade.B)
                    .currentPrice(new BigDecimal("949.00"))
                    .status(UnitStatus.AVAILABLE)
                    .acquisitionDate(LocalDateTime.now().minusDays(20))
                    .build());

            cartRepository.save(Cart.builder()
                    .user(user)
                    .status(CartStatus.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .build());
        };
    }
}
