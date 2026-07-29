package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.Product;
import com.ecommerce.enums.ConditionGrade;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.UnitStatus;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getStats() {
        List<Product> products = productRepository.findAllWithUnits();
        List<Order> orders = orderRepository.findAllOrderByCreatedAtDesc();

        BigDecimal revenue = orders.stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long availableUnits = products.stream()
                .flatMap(p -> p.getUnits().stream())
                .filter(unit -> unit.getStatus() == UnitStatus.AVAILABLE)
                .count();

        BigDecimal avgPrice = products.isEmpty()
                ? BigDecimal.ZERO
                : products.stream().map(Product::getBasePrice).reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(products.size()), 2, java.math.RoundingMode.HALF_UP);

        // Répartition du stock disponible par grade (NEW / A / B / C) — le
        // cœur du positionnement "reconditionné certifié" de Reforge.
        Map<ConditionGrade, Long> gradeBreakdown = new EnumMap<>(ConditionGrade.class);
        for (ConditionGrade grade : ConditionGrade.values()) {
            gradeBreakdown.put(grade, 0L);
        }
        products.stream()
                .flatMap(p -> p.getUnits().stream())
                .filter(unit -> unit.getStatus() == UnitStatus.AVAILABLE)
                .forEach(unit -> gradeBreakdown.merge(unit.getGrade(), 1L, Long::sum));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("revenue", revenue);
        stats.put("orderCount", orders.size());
        stats.put("productCount", products.size());
        stats.put("availableUnits", availableUnits);
        stats.put("userCount", userRepository.count());
        stats.put("avgPrice", avgPrice);
        stats.put("gradeBreakdown", gradeBreakdown);
        return stats;
    }
}
