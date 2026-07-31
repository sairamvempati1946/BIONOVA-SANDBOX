package com.bionova.repository;

import com.bionova.entity.TaskDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskDraftRepository extends JpaRepository<TaskDraft, Long> {
    List<TaskDraft> findByDrftMId(Long drftMId);
    boolean existsByTaskCd(String taskCd);
    boolean existsByTaskCdAndDrftTaskIdNot(String taskCd, Long drftTaskId);
}
