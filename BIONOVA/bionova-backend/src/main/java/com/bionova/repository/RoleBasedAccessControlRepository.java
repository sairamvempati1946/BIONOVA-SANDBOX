package com.bionova.repository;

import com.bionova.entity.RoleBasedAccessControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleBasedAccessControlRepository extends JpaRepository<RoleBasedAccessControl, Long> {
    List<RoleBasedAccessControl> findByRoleId(Integer roleId);
}
