package com.example.usermanagement.repository;

import com.example.usermanagement.entity.RetailerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RetailerProfileRepository extends JpaRepository<RetailerProfile, Long> {
}