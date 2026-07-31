package com.bionova.controller;

import com.bionova.entity.ProjectDraft;
import com.bionova.repository.ProjectDraftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/project-drafts")
public class ProjectDraftController {

    @Autowired
    private ProjectDraftRepository projectDraftRepository;

    @Autowired
    private com.bionova.repository.MilestoneDraftRepository milestoneDraftRepository;

    @Autowired
    private com.bionova.repository.TaskDraftRepository taskDraftRepository;

    /** GET all drafts */
    @GetMapping
    public List<ProjectDraft> getAll() {
        return projectDraftRepository.findAll();
    }

    /** GET by ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return projectDraftRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET drafts by company */
    @GetMapping("/by-company/{coyId}")
    public List<ProjectDraft> getByCompany(@PathVariable Integer coyId) {
        return projectDraftRepository.findByCoyId(coyId);
    }

    /** GET drafts by company + plant */
    @GetMapping("/by-company/{coyId}/plant/{pltId}")
    public List<ProjectDraft> getByCompanyAndPlant(
            @PathVariable Integer coyId,
            @PathVariable Integer pltId) {
        return projectDraftRepository.findByCoyIdAndPltId(coyId, pltId);
    }

    /** POST – create new draft (auto-computes no_of_days, sets status DRAFT) */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProjectDraft draft) {
        if (draft.getPrjCd() != null && !draft.getPrjCd().trim().isEmpty()) {
            if (projectDraftRepository.existsByPrjCd(draft.getPrjCd())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Project code already exists."));
            }
        }

        draft.setPrjSts("DRAFT");

        // Auto-compute tentative days
        if (draft.getTentStDt() != null && draft.getTentEndDt() != null) {
            long days = ChronoUnit.DAYS.between(draft.getTentStDt(), draft.getTentEndDt());
            draft.setNoOfDays((int) days);
        }

        ProjectDraft saved = projectDraftRepository.save(draft);
        return ResponseEntity.ok(saved);
    }

    /** PUT – update draft */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody ProjectDraft details) {

        ProjectDraft draft = projectDraftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found: " + id));

        if (details.getPrjCd() != null && !details.getPrjCd().trim().isEmpty()) {
            if (projectDraftRepository.existsByPrjCdAndDrftPrjIdNot(details.getPrjCd(), id)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Project code already exists."));
            }
            draft.setPrjCd(details.getPrjCd());
        }

        draft.setPrjNm(details.getPrjNm());
        draft.setPrjDesc(details.getPrjDesc());
        draft.setDeptId(details.getDeptId());
        draft.setPrjPrty(details.getPrjPrty());
        draft.setTentStDt(details.getTentStDt());
        draft.setTentEndDt(details.getTentEndDt());
        draft.setCoyId(details.getCoyId());
        draft.setPltId(details.getPltId());
        draft.setPrjObjtv(details.getPrjObjtv());
        draft.setExpDlvbls(details.getExpDlvbls());
        draft.setLogo(details.getLogo());
        draft.setAddlRem(details.getAddlRem());

        // Recompute no_of_days
        if (draft.getTentStDt() != null && draft.getTentEndDt() != null) {
            long days = ChronoUnit.DAYS.between(draft.getTentStDt(), draft.getTentEndDt());
            draft.setNoOfDays((int) days);
        }

        ProjectDraft saved = projectDraftRepository.save(draft);

        // Validate if any milestones or tasks exceed new project limits
        String warning = null;
        List<com.bionova.entity.MilestoneDraft> milestones = milestoneDraftRepository.findByDrftPrjId(id);
        for (com.bionova.entity.MilestoneDraft milestone : milestones) {
            if (milestone.getTentStDt() != null && milestone.getTentEndDt() != null) {
                if (milestone.getTentStDt().isBefore(saved.getTentStDt()) ||
                    milestone.getTentEndDt().isAfter(saved.getTentEndDt()) ||
                    (milestone.getMlstnDays() != null && saved.getNoOfDays() != null && milestone.getMlstnDays() > saved.getNoOfDays())) {
                    warning = "Warning: Some milestones or tasks now exceed the updated project limits. Please review and update them accordingly.";
                    break;
                }
            }
            
            // Check tasks of this milestone
            List<com.bionova.entity.TaskDraft> tasks = taskDraftRepository.findByDrftMId(milestone.getDrftMId());
            for (com.bionova.entity.TaskDraft task : tasks) {
                if (task.getTentStDt() != null && task.getTentEndDt() != null) {
                    if (task.getTentStDt().isBefore(saved.getTentStDt()) ||
                        task.getTentEndDt().isAfter(saved.getTentEndDt()) ||
                        (task.getNoOfDays() != null && saved.getNoOfDays() != null && task.getNoOfDays() > saved.getNoOfDays())) {
                        warning = "Warning: Some milestones or tasks now exceed the updated project limits. Please review and update them accordingly.";
                        break;
                    }
                }
            }
            if (warning != null) {
                break;
            }
        }

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("data", saved);
        if (warning != null) {
            response.put("warning", warning);
        }
        return ResponseEntity.ok(response);
    }

    /** DELETE */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectDraftRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
