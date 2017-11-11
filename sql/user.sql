CREATE TABLE user (
    id_user INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    encrypted_password CHAR(60) NOT NULL,
    UNIQUE KEY(email)
) ENGINE=InnoDB;
