DROP DATABASE IF EXISTS tracker;
CREATE DATABASE tracker;

USE tracker;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT NOT NULL,
  constraint fk_department foreign key (department_id) references department(id) on delete cascade
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  constraint fk_role foreign key (role_id) references role(id) on delete cascade,
  manager_id INT,
  constraint fk_manager foreign key (manager_id) references employee(id) on delete set null
  );