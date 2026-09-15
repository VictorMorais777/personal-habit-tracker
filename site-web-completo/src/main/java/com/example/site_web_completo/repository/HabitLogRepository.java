package com.example.site_web_completo.repository;

import com.example.site_web_completo.model.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    List<HabitLog> findByHabitId(Long habitId);
    Optional<HabitLog> findByHabitIdAndDate(Long habitId, LocalDate date);
}