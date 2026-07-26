package com.ecommerce.repository;

import com.ecommerce.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    // Les relations de Cart (items, productUnit, product) sont toutes en
    // FetchType.LAZY et open-in-view est désactivé : la session Hibernate est
    // fermée dès que le repository répond. Sans ce JOIN FETCH, construire la
    // réponse JSON dans le controller lève une LazyInitializationException
    // dès qu'on lit cart.getItems().
    @Query("select distinct c from Cart c " +
            "left join fetch c.items i " +
            "left join fetch i.productUnit pu " +
            "left join fetch pu.product " +
            "where c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(Long userId);

    @Query("select distinct c from Cart c " +
            "left join fetch c.items i " +
            "left join fetch i.productUnit pu " +
            "left join fetch pu.product " +
            "where c.id = :cartId")
    Optional<Cart> findByIdWithItems(Long cartId);
}
