package com.ecommerce.service;

import com.ecommerce.entity.*;
import com.ecommerce.enums.CartStatus;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.UnitStatus;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Order checkout(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found for user: " + userId));

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .user(cart.getUser())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            ProductUnit unit = cartItem.getProductUnit();
            BigDecimal subtotal = unit.getCurrentPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(subtotal);

            unit.setStatus(UnitStatus.RESERVED);

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .productUnit(unit)
                    .unitPrice(unit.getCurrentPrice())
                    .build());
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        cart.setStatus(CartStatus.CHECKED_OUT);
        cart.getItems().clear();

        return orderRepository.save(order);
    }
}
