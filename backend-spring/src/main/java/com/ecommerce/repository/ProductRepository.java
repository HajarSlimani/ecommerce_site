package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("select distinct p from Product p left join fetch p.units left join fetch p.category")
    List<Product> findAllWithUnits();

    @Query("select p from Product p left join fetch p.units left join fetch p.category where p.id = :id")
    java.util.Optional<Product> findByIdWithUnits(Long id);

    java.util.Optional<Product> findByName(String name);
}
