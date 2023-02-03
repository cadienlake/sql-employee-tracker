const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

// connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: process.env.PW,
    database: "tracker",
  },
  console.log(`Connected to the tracker database.`)
);

function viewDepartments() {
  // Query database
  db.query("SELECT * FROM department", function (err, results) {
    console.table(results);
    anythingElse();
  });
}

function viewRoles() {
  // Query database
  db.query("SELECT role.id, role.title, role.salary, department.dept_name FROM role JOIN department ON role.department_id = department.id", function (err, results) {
    console.table(results);
    anythingElse();
  });
}

function viewEmployees() {
  // Query database
  db.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.dept_name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;", function (err, results) {
    console.table(results);
    anythingElse();
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        message: "What is the department name?",
        name: "dept_name",
      },
    ])
    .then((answer) => {
      db.query("INSERT INTO department SET ?", answer, function (err, results) {
        console.table(results);
        console.log("Department successfully added");
        anythingElse();
      });
    });
}

function addRole() {
  db.query("SELECT * FROM department", function (err, results) {
    const departments = results.map((department) => ({ name: department.dept_name, value: department.id }));
    inquirer
      .prompt([
        {
          message: "What is the title?",
          name: "title",
        },
        {
          message: "What is the salary?",
          name: "salary",
        },
        {
          type: "list",
          message: "What department does thie role belong to?",
          name: "department_id",
          choices: departments,
        },
      ])
      .then((answer) => {
        db.query("INSERT INTO role SET ?", answer, function (err, results) {
          console.table(results);
          console.log("Role successfully added");
          anythingElse();
        });
      });
  });
}

function addEmployee() {
  db.query("SELECT * FROM role", function (err, results) {
    const roles = results.map((role) => ({ name: role.title, value: role.id }));
    db.query("SELECT * FROM employee WHERE manager_id IS NULL", function (err, results) {
      const managers = results.map((manager) => ({ name: manager.first_name + " " + manager.last_name, value: manager.id }));
      managers.unshift({ name: "None", value: null });
      inquirer
        .prompt([
          {
            message: "What is the employee's first name?",
            name: "first_name",
          },
          {
            message: "What is the employee's last name?",
            name: "last_name",
          },
          {
            type: "list",
            message: "What is the employees role?",
            name: "role_id",
            choices: roles,
          },
          {
            type: "list",
            message: "Who is their manager?",
            name: "manager_id",
            choices: managers,
          },
        ])
        .then((answer) => {
          db.query("INSERT INTO employee SET ?", answer, function (err, results) {
            console.table(results);
            console.log("Employee successfully added");
            anythingElse();
          });
        });
    });
  });
}

function updateEmployee() {
  db.query("SELECT * FROM employee", function (err, results) {
    const employees = results.map((employee) => ({ name: employee.first_name + " " + employee.last_name, value: employee.id }));
    db.query("SELECT * FROM role", function (err, results) {
      const roles = results.map((role) => ({ name: role.title, value: role.id }));
      db.query("SELECT * FROM employee WHERE manager_id IS NULL", function (err, results) {
        const managers = results.map((manager) => ({ name: manager.first_name + " " + manager.last_name, value: manager.id }));
        managers.unshift({ name: "None", value: null });
        inquirer
          .prompt([
            {
              type: "list",
              message: "Which employee would you like to update?",
              name: "id",
              choices: employees,
            },
            {
              type: "list",
              message: "What role would you like to assign this employee?",
              name: "role_id",
              choices: roles,
            },
            {
              type: "list",
              message: "Who is their manager?",
              name: "manager_id",
              choices: managers,
            },
          ])
          .then((answer) => {
            db.query("UPDATE employee SET role_id = ? WHERE id = ? ", [answer.role_id, answer.id], function (err, results) {});
            db.query("UPDATE employee SET manager_id = ? WHERE id = ? ", [answer.manager_id, answer.id], function (err, results) {
              console.log("Employee updated successfully");
              anythingElse();
            });
          });
      });
    });
  });
}

function anythingElse() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Would you like to do anything else?",
        name: "choice",
        choices: [
          { name: "Yes", value: "YES" },
          { name: "No", value: "NO" },
        ],
      },
    ])
    .then((response) => {
      if (response.choice === "YES") {
        initState();
      }
      if (response.choice === "NO") {
        process.exit();
      }
    });
}

function initState() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "choice",
        choices: [
          { name: "View all departments", value: "VIEW_DEPARTMENTS" },
          { name: "View all roles", value: "VIEW_ROLES" },
          { name: "View all employees", value: "VIEW_EMPLOYEES" },
          { name: "Add a department", value: "ADD_DEPARTMENT" },
          { name: "Add a role", value: "ADD_ROLE" },
          { name: "Add an employee", value: "ADD_EMPLOYEE" },
          { name: "Update an employee role", value: "UPDATE_ROLE" },
          { name: "Exit", value: "EXIT" },
        ],
      },
    ])
    .then((response) => {
      if (response.choice === "VIEW_DEPARTMENTS") {
        viewDepartments();
      }
      if (response.choice === "VIEW_ROLES") {
        viewRoles();
      }
      if (response.choice === "VIEW_EMPLOYEES") {
        viewEmployees();
      }
      if (response.choice === "ADD_DEPARTMENT") {
        addDepartment();
      }
      if (response.choice === "ADD_ROLE") {
        addRole();
      }
      if (response.choice === "ADD_EMPLOYEE") {
        addEmployee();
      }
      if (response.choice === "UPDATE_ROLE") {
        updateEmployee();
      }
      if (response.choice === "EXIT") {
        process.exit();
      }
    });
}

initState();
