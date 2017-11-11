CREATE TABLE project (
    id_project INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fk_user INT(10) NOT NULL,
    CONSTRAINT project_fk_user FOREIGN KEY (fk_user) REFERENCES user(id_user)
) ENGINE=InnoDB;
