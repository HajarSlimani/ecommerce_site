package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Sans ce JOIN FETCH, order.getItems() lève une LazyInitializationException
    // dans OrderController (open-in-view désactivé) — même bug que sur Cart.
    @Query("select distinct o from Order o " +
            "left join fetch o.items i " +
            "left join fetch i.productUnit pu " +
            "left join fetch pu.product " +
            "where o.user.id = :userId " +
            "order by o.createdAt desc")
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
