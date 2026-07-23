package com.ecommerce.repository;

import com.ecommerce.entity.CompetitorPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetitorPriceRepository extends JpaRepository<CompetitorPrice, Long> {
    List<CompetitorPrice> findTop10ByProductIdOrderByCapturedAtDesc(Long productId);
}
