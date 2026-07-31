package com.bionova.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "screen_master")
@Getter
@Setter
public class ScreenMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screen_id")
    private Integer screenId;

    @Column(name = "screen_cd", nullable = false, unique = true, length = 50)
    private String screenCode;

    @Column(name = "screen_nm", nullable = false, length = 100)
    private String screenNm;

    @Column(name = "module_nm", length = 100)
    private String moduleNm;
}
