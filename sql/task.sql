CREATE TABLE task (
    id_task INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    fk_tasklist INT(10) NOT NULL,
    fk_user INT(10) NOT NULL,
    CONSTRAINT task_fk_tasklist FOREIGN KEY (fk_tasklist) REFERENCES tasklist(id_tasklist),
    CONSTRAINT task_fk_user FOREIGN KEY (fk_user) REFERENCES user(id_user)
) ENGINE=InnoDB;
