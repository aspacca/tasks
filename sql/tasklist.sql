CREATE TABLE tasklist (
    id_tasklist INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    fk_project INT(10) NOT NULL,
    fk_user INT(10) NOT NULL,
    CONSTRAINT tasklist_fk_project FOREIGN KEY (fk_project) REFERENCES project(id_project),
    CONSTRAINT tasklist_fk_user FOREIGN KEY (fk_user) REFERENCES user(id_user)
) ENGINE=InnoDB;
