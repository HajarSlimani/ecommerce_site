package com.ecommerce.config;

import com.ecommerce.entity.*;
import com.ecommerce.enums.ConditionGrade;
import com.ecommerce.enums.Role;
import com.ecommerce.enums.UnitStatus;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds a demo customer account, a demo admin account, and a product catalog
 * on every boot. Idempotent: each entity is only inserted if it doesn't
 * already exist (by email for users, by name for products), so you can add
 * new entries to CATALOG below and just restart the backend — existing data
 * won't be touched or duplicated.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private record SeedUnit(String serialNumber, ConditionGrade grade, double price) {}

    private record SeedProduct(String name, String description, String category, double basePrice, List<SeedUnit> units) {}

    // 👉 Ajoute tes produits ici. Chaque entrée = un produit avec ses unités (stock).
    private static final List<SeedProduct> CATALOG = List.of(
            new SeedProduct(
                    "Cyber Kid Infini",
                    "Jeu d'action cyberpunk, édition standard.",
                    "Jeux", 59.99,
                    List.of(new SeedUnit("SN-CKI-001", ConditionGrade.NEW, 59.99),
                            new SeedUnit("SN-CKI-002", ConditionGrade.NEW, 59.99))
            ),
            new SeedProduct(
                    "Nova Strike Legacy",
                    "FPS tactique multijoueur, édition deluxe avec bonus.",
                    "Jeux", 69.99,
                    List.of(new SeedUnit("SN-NSL-001", ConditionGrade.NEW, 69.99))
            ),
            new SeedProduct(
                    "Rift Chronicles III",
                    "RPG open-world, monde persistant, coop 4 joueurs.",
                    "Jeux", 54.90,
                    List.of(new SeedUnit("SN-RC3-001", ConditionGrade.NEW, 54.90),
                            new SeedUnit("SN-RC3-002", ConditionGrade.A, 44.90))
            ),
            new SeedProduct(
                    "Wave Gen RX",
                    "Manette sans fil haute précision, latence réduite.",
                    "Matériel", 79.90,
                    List.of(new SeedUnit("SN-WGX-001", ConditionGrade.A, 79.90),
                            new SeedUnit("SN-WGX-002", ConditionGrade.B, 69.90))
            ),
            new SeedProduct(
                    "Clavier mécanique Ignis 87",
                    "Switches mécaniques rouges, rétroéclairage RGB.",
                    "Matériel", 94.00,
                    List.of(new SeedUnit("SN-IGN-001", ConditionGrade.NEW, 94.00))
            ),
            new SeedProduct(
                    "Écran Vortex 27\" 165Hz",
                    "Dalle IPS, 1ms, idéal pour le compétitif.",
                    "Matériel", 259.00,
                    List.of(new SeedUnit("SN-VTX-001", ConditionGrade.NEW, 259.00),
                            new SeedUnit("SN-VTX-002", ConditionGrade.A, 229.00))
            ),
            new SeedProduct(
                    "Souris sans fil X-2",
                    "Souris gaming légère, capteur 26K DPI.",
                    "Accessoires", 49.50,
                    List.of(new SeedUnit("SN-MX2-001", ConditionGrade.NEW, 49.50))
            ),
            new SeedProduct(
                    "Chronosplit",
                    "Casque audio immersif 7.1.",
                    "Accessoires", 89.00,
                    List.of(new SeedUnit("SN-CHS-001", ConditionGrade.A, 89.00),
                            new SeedUnit("SN-CHS-002", ConditionGrade.A, 84.00))
            ),
            new SeedProduct(
                    "Tapis de souris XL Aurora",
                    "Surface control, bords cousus, 900x400mm.",
                    "Accessoires", 24.90,
                    List.of(new SeedUnit("SN-TSX-001", ConditionGrade.NEW, 24.90))
            )
    );

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmail("demo@reforge.dev").isEmpty()) {
            userRepository.save(User.builder()
                    .email("demo@reforge.dev")
                    .password(passwordEncoder.encode("demo-password"))
                    .role(Role.CUSTOMER)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        // Compte admin de démo pour accéder au dashboard (/admin côté frontend).
        if (userRepository.findByEmail("admin@reforge.dev").isEmpty()) {
            userRepository.save(User.builder()
                    .email("admin@reforge.dev")
                    .password(passwordEncoder.encode("admin-password"))
                    .role(Role.ADMIN)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        for (SeedProduct seed : CATALOG) {
            if (productRepository.findByName(seed.name()).isPresent()) {
                continue;
            }

            Category category = categoryRepository.findByName(seed.category())
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(seed.category()).build()));

            Product product = Product.builder()
                    .name(seed.name())
                    .description(seed.description())
                    .category(category)
                    .basePrice(BigDecimal.valueOf(seed.basePrice()))
                    .imageUrl(placeholderImage(seed.name()))
                    .build();

            seed.units().forEach(unitSeed -> {
                ProductUnit unit = ProductUnit.builder()
                        .serialNumber(unitSeed.serialNumber())
                        .grade(unitSeed.grade())
                        .currentPrice(BigDecimal.valueOf(unitSeed.price()))
                        .status(UnitStatus.AVAILABLE)
                        .acquisitionDate(LocalDateTime.now())
                        .build();
                unit.setProduct(product);
                product.getUnits().add(unit);
            });

            productRepository.save(product);
        }
    }

    // Le backend n'a pas encore de vraies photos produit : on génère une image
    // de repli stable (toujours la même pour un même nom de produit), avec le
    // même service que le frontend (picsum.photos), en attendant un vrai
    // pipeline d'upload d'images.
    private String placeholderImage(String productName) {
        String seed = URLEncoder.encode(productName, StandardCharsets.UTF_8);
        return "https://picsum.photos/seed/" + seed + "/480/360";
    }
}
