package com.bionova.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "role_based_access_control")
@Getter
@Setter
public class RoleBasedAccessControl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rbac_id")
    private Long rbacId;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "screen_id", nullable = false)
    private Integer screenId;

    @Column(name = "view_flg")
    private Boolean viewFlg = true;

    @Column(name = "crt_flg")
    private Boolean crtFlg = true;

    @Column(name = "edit_flg")
    private Boolean editFlg = true;

    @Column(name = "del_flg")
    private Boolean delFlg = true;
}
